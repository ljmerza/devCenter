#!/usr/bin/perl

use strict;
use warnings;

BEGIN {
	use lib ( "/opt/@{[ ( getpwuid($<) )[0] ]}/includes", "/opt/includes/DTI", "/opt/includes");
}

binmode STDOUT, ":utf8";

use utf8;
use JSON;
use File::Path qw(make_path);
use Data::Dumper;

use M5::DB;
use OMX;
use M5::REST::WATSON::ODB;
use M5::REST::WATSON::ACTS;



my $dirname = 'data';
my $output = "$dirname/deep_order_data.json";
make_path($dirname, {chmod => 0777});

sub db_connect_odb_ro {
	my ($class) = @_;
	return M5::DB->connect(
		db => 'odb',
		mode => 'read',
		use_prod => 1
	);
}

my $dbh = db_connect_odb_ro();

my $sql = ";
SELECT TOP 10 *
FROM ODB.dbo.CORE_ENOC1CENTER_DB2 as Core 
right join odb.dbo.DB2_Feeds_Refresh as Refresh 
on Core.cktid = Refresh.cktid and Core.event_type = Refresh.event_type 
AND Refresh.cmp_dt is NULL";

my $sth = $dbh->prepare($sql);
$sth->execute();
my $order_data = $sth->fetchall_arrayref({});

my @deep_order_data = ();
my @recorded_orders = ();

foreach my $order (@{$order_data}){
	my $order_number = $order->{OrdNum};
	my $trk = $order->{trk};

	if($order_number and not grep(/^$order_number$/, @recorded_orders) ){
		push @recorded_orders, $order_number;
		print("getting data for order number $order_number\n");
		add_order_to_list($order_number, 'ORDER');
	}

	if($trk and not grep(/^$trk$/, @recorded_orders) ){
		push @recorded_orders, $trk;
		print("getting data for trk $trk\n");
		add_order_to_list($trk, 'CLO');
	}
}


# create JSON dump
open my $fh, ">", $output or die "Cannot open file '$output': $!\n";
print $fh encode_json(\@deep_order_data);
close $fh;


sub add_order_to_list {
	my ($fuzzy_order, $type) = @_;

	my $ODB = M5::REST::WATSON::ODB->new();
	my $response = $ODB->get_orders(fuzzy_order => $fuzzy_order, deep => 1);

	if('HASH' eq ref $response and $response->{OdbRecordList}) {
		push @deep_order_data, process_order($response->{OdbRecordList}, $type);
	}
}


sub trim { 
	my $s = shift; 
	return '' if(not $s or $s eq 'null');
	$s =~ s/^\s+|\s+$//g; 
	return $s 
};

sub process_order {
	my ($odb_records, $type) = @_;

	my $formatted_records = {};

	foreach my $record (@{$odb_records}){
		my $component_type = $record->{BpoComponent};

		# general Order data
		my $data = {
			WfaClo => trim($record->{WfaClo}),
			BpoCktId => trim($record->{BpoCktId}),
			WfaRegion => trim($record->{WfaRegion}),
			AsedbSiteId => trim($record->{AsedbSiteId}),
			CanopiPo => trim($record->{CanopiPo}),
			CanopiTo => trim($record->{CanopiTo}),
			ExactPon => trim($record->{ExactPon}),
			OmxOrderId => trim($record->{OmxOrderId}),
		};

		if($component_type eq 'ATX'){
			# $data = get_atx($record, $data);
		} else {
			# $data = get_asedb($record, $data);
			# $data = get_canpoi($record, $data, $type);
			# $data = get_edge_force($record, $data);
			# $data = get_wfa_details($record, $data);
			# $data = get_omx_ocx($record, $data);
			$data = get_data($record, $data);
			# $data = get_cth($record, $data);
			# $data = get_watson($record, $data);
		}

		if($component_type eq 'UNI'){
			# $data = get_acts($record, $data);
			# $data = is_ean($record, $data);
		}
		
		unless(defined $formatted_records->{$component_type}){
			$formatted_records->{$component_type} = ();
		}
		push @{$formatted_records->{$component_type}}, $data;
	}

	return $formatted_records;
}


sub get_asedb {
	my ($record, $data) = @_;

	if(my $asedb_info = $record->{Details}->{AsedbDetails}){
		$data->{asedb} = {};
		$data->{asedb}->{ASR} = trim($asedb_info->{ASR});
		$data->{asedb}->{AT_T_ECCKT} = trim($asedb_info->{AT_T_ECCKT});
		$data->{asedb}->{CNL_Number} = trim($asedb_info->{CNL_Number});
		$data->{asedb}->{Canopi_Project_Order_Num} = trim($asedb_info->{Canopi_Project_Order_Num});
		$data->{asedb}->{IPAG_CLLI} = trim($asedb_info->{IPAG_CLLI});
		$data->{asedb}->{NTE_CLLI} = trim($asedb_info->{NTE_CLLI});
		$data->{asedb}->{OMX_Order_Number} = trim($asedb_info->{OMX_Order_Number});
		$data->{asedb}->{PON} = trim($asedb_info->{PON});
		$data->{asedb}->{Opportunity_ID} = trim($asedb_info->{Opportunity_ID});
		$data->{asedb}->{Site_ID} = trim($asedb_info->{Site_ID});
		$data->{asedb}->{UNI_CLO} = trim($asedb_info->{UNI_CLO});
	}

	return $data;
}

sub get_canpoi {
	my ($record, $data, $type) = @_;

	my $canopi_keys = {
		CanopiToCnlDetails => 'cnl_to',
		CanopiToAdiDetails => 'adi_to',
		CanopiToUniDetails => 'uni_to',
		CanopiToEvcDetails => 'evc_to',
		CanopiToEvcMptDetails => 'evc_mpt_to',
		
		CanopiPoCnlDetails => 'cnl_po',
		CanopiPoAdiDetails => 'adi_po',
		CanopiPoUniDetails => 'uni_po',
		CanopiPoEvcDetails => 'evc_po',
		CanopiPoEvcMptDetails => 'evc_mpt_po'
	};

	my $canopi_action_keys = {
		CanopiToCnlActionItems => 'cnl_to_actions',
		CanopiToAdiActionItems => 'adi_to_actions',
		CanopiToUniActionItems => 'uni_to_actions',
		CanopiToEvcActionItems => 'evc_to_actions',
		CanopiToEvcMptActionItems => 'evc_mpt_to_actions',

		CanopiPoCnlActionItems => 'cnl_po_actions',
		CanopiPoAdiActionItems => 'adi_po_actions',
		CanopiPoUniActionItems => 'uni_po_actions',
		CanopiPoEvcActionItems => 'evc_po_actions',
		CanopiPoEvcMptActionItems => 'evc_mpt_po_actions'
	};

	# get general canopi data
	foreach my $canopi_type (keys %{$canopi_keys}){

		if(my $canpoi = $record->{Details}->{$canopi_type}){

			my $key = $canopi_keys->{$canopi_type};
			$data->{canopi} = {};
			$data->{canopi}->{$key} = {};

			$data->{canopi}->{$key}->{facilityId} = trim($canpoi->{facilityId});
			$data->{canopi}->{$key}->{orderId} = trim($canpoi->{orderId});
			$data->{canopi}->{$key}->{ipagRouterClli} = trim($canpoi->{ipagRouterClli});
			$data->{canopi}->{$key}->{purchaseOrderNumber} = trim($canpoi->{purchaseOrderNumber});
			$data->{canopi}->{$key}->{tirksClo} = trim($canpoi->{tirksClo});
			$data->{canopi}->{$key}->{nteClli} = trim($canpoi->{nteClli});
			$data->{canopi}->{$key}->{ipagRouterClli} = trim($canpoi->{ipagRouterClli});
			$data->{canopi}->{$key}->{emuxName} = trim($canpoi->{emuxName});
		}
	}

	# get all CANOPI action items
	foreach my $canopi_action_type (keys %{$canopi_action_keys}){
		if(my $canpoi = $record->{Details}->{$canopi_action_type}){

			my $key = $canopi_action_keys->{$canopi_action_type};
			$data->{canopi_actions} = {};
			$data->{canopi_actions}->{$key} = {};

			# get overall action data
			$data->{canopi_actions}->{$key}->{orderId} = trim($canpoi->{orderId});
			$data->{canopi_actions}->{$key}->{orderType} = trim($canpoi->{orderType});
			$data->{canopi_actions}->{$key}->{serviceId} = trim($canpoi->{serviceId});

			# get all action items
			if($canpoi->{ActionItemList} and scalar @{$canpoi->{ActionItemList}}){
				$data->{canopi_actions}->{$key}->{items} = ();
				foreach my $action_item (@{$canpoi->{ActionItemList}}){
					push @{$data->{canopi_actions}->{$key}->{items}}, trim($action_item->{id});
				}
			}

			# get current action items
			if($canpoi->{CurrentActionItemList} and scalar @{$canpoi->{CurrentActionItemList}}){
				$data->{canopi_actions}->{$key}->{current} = ();
				foreach my $action_item (@{$canpoi->{CurrentActionItemList}}){
					push @{$data->{canopi_actions}->{$key}->{current}}, trim($action_item->{id});
				}
			}
		}
	}

	return $data;
}




sub get_wfa_details {
	my ($record, $data) = @_;

	my $wfa_keys = {
		WfaCnlDetails => 'wfa_cnl',
		WfaAdiDetails => 'wfa_adi',
		WfaUniDetails => 'wfa_uni',
		WfaEvcDetails => 'wfa_evc',
	};

	foreach my $wfa_type (keys %{$wfa_keys}){
		if(my $wfa = $record->{Details}->{$wfa_type}){

			my $key = $wfa_keys->{$wfa_type};
			$data->{wfa} = {};
			$data->{wfa}->{$key} = {};

			$data->{wfa}->{$key}->{ALOC} = trim($wfa->{ALOC});
			$data->{wfa}->{$key}->{ZLOC} = trim($wfa->{ZLOC});
			$data->{wfa}->{$key}->{ORD} = trim($wfa->{ORD});
			$data->{wfa}->{$key}->{ACT} = trim($wfa->{ACT});
			$data->{wfa}->{$key}->{RO} = trim($wfa->{RO});

			if($wfa->{EVENT_LIST} and scalar @{$wfa->{EVENT_LIST}}){
				$data->{wfa}->{$key}->{events} = ();

				foreach my $event (@{$wfa->{EVENT_LIST}}){
					my $event_item = {};
					$event_item->{CMP} = trim($event->{CMP});
					$event_item->{EVT} = trim($event->{EVT});
					$event_item->{JEP1} = trim($event->{JEP1});
					$event_item->{JEP2} = trim($event->{JEP2});
					$event_item->{JEP3} = trim($event->{JEP3});

					push @{$data->{wfa}->{$key}->{events}}, $event_item;
				}
			}
		}
	}

	return $data;
}

sub get_atx {
	my ($record, $data) = @_;

	if(my $atx = $record->{Details}){
		$data->{atx} = $record->{Details};
	}

	return $data;
}


sub get_acts {
	my ($record, $data) = @_;

	my $acts = M5::REST::WATSON::ACTS->new();
	$data->{is_acts} = $acts->is_candidate(
		uniclo => $record->{WfaClo}, 
		region => $record->{WfaRegion}, 
		attuid => 'lm240n'
	);

	return $data;
}


sub is_ean {
	my ($record, $data) = @_;

	my @ean_names = ("BLUEGRASS", "CRICKET", "METRO", "SPRINT", "TELEPAK", "CELLULAR SOUTH", "CSPIRE", "T-MOBILE", "T MOBILE", "TMOBILE", "US-CELLULAR", "US CELLULAR", "VERIZON");

	if($record->{Details} and $record->{Details}->{WfaUniDetails} and my $customer = $record->{Details}->{WfaUniDetails}->{CUSTNAME}){
		$data->{is_ean} = grep{ $customer =~ m/$_/ } @ean_names;
	} else {
		$data->{is_ean} = 0;
	}

	return $data;
}


sub get_data {
	my ($record, $data) = @_;


	my @data_to_get = (
		{
			item_key => 'omx_ocx',
			item_properties => {
				OcxCnlDetails => 'ocx_cnl',
				OcxAdiDetails => 'ocx_adi',
				OcxUniDetails => 'ocx_uni',
				OcxEvcDetails => 'ocx_evc',
				OmxCnlDetails => 'omx_cnl',
				OmxAdiDetails => 'omx_adi',
				OmxUniDetails => 'omx_uni',
				OmxEvcDetails => 'omx_evc',
			},
			properties => ['contractId', 'OrderNumber', 'DeviceClli', 'CktId', 'edgeDeviceID', 'orderId']
		},
		{
			item_key => 'edge_force',
			item_properties => {
				EdgeForceCnlDetails => 'edge_cnl',
				EdgeForceAdiDetails => 'edge_adi',
				EdgeForceUniDetails => 'edge_uni',
				EdgeForceEvcDetails => 'edge_evc',
			},
			properties => ['WRID', 'CAC', 'ORD', 'FORCE_STAT', 'DSP_CLLI']
		},
		{
			item_key => 'cth',
			item_properties => {
				CthFalloutListCnlDetails => 'cth_cnl',
				CthFalloutListAdiDetails => 'cth_adi',
				CthFalloutListUniDetails => 'cth_uni',
				CthFalloutListEvcDetails => 'cth_evc'
			}
		},
		{
			item_key => 'watson',
			item_properties => {
				WatsonStatusCnlDetails => 'watson_cnl',
				WatsonStatusAdiDetails => 'watson_adi',
				WatsonStatusUniDetails => 'watson_uni',
				WatsonStatusEvcDetails => 'watson_evc'
			}
		}
	);

	foreach my $data_getter (@data_to_get){
		my $item_key = $data_getter->{item_key};
		my $item_properties = $data_getter->{item_properties};
		my $properties = $data_getter->{properties};

		foreach my $prop_type (keys %{$item_properties}){

			# if property exist on main object the get it
			if(my $item = $record->{Details}->{$prop_type}){

				my $key = $item_properties->{$prop_type};
				$data->{$item_key} = {};

				if('HASH' eq ref $item){
					$data->{$item_key}->{$key} = {};

					# if custom properties wanted get them else save all
					if($properties){
						foreach my $prop (@{$properties}){
							$data->{$item_key}->{$key}->{$prop} = trim($item->{$prop});
						}
					} else {
						$data->{$item_key}->{$key} = $item;
					}

				} else {
					$data->{$item_key}->{$key} = ();

					foreach my $inner_item (@{$item}){
						# if custom properties wanted get them else save all
						if($properties){
							my $new_inner_item = {};
							foreach my $prop (@{$properties}){
								$new_inner_item->{$prop} = trim($inner_item->{$prop});
							}
							push @{$data->{$item_key}->{$key}}, $new_inner_item;

						} else {
							push @{$data->{$item_key}->{$key}}, $inner_item;
						}
					}	
				}	
			}
		}
	}

	return $data;
}

sub get_omx_ocx {
	my ($record, $data) = @_;

	my $item_key = 'omx_ocx';
	my $omx_ocx_keys = {
		OcxCnlDetails => 'ocx_cnl',
		OcxAdiDetails => 'ocx_adi',
		OcxUniDetails => 'ocx_uni',
		OcxEvcDetails => 'ocx_evc',
		OmxCnlDetails => 'omx_cnl',
		OmxAdiDetails => 'omx_adi',
		OmxUniDetails => 'omx_uni',
		OmxEvcDetails => 'omx_evc',
	};

	foreach my $omx_ocx_type (keys %{$omx_ocx_keys}){

		if(my $item = $record->{Details}->{$omx_ocx_type}){
			my $key = $omx_ocx_keys->{$omx_ocx_type};
			$data->{$item_key}->{$key} = {};

			$data->{$item_key}->{$key}->{contractId} = trim($item->{contractId});
			$data->{$item_key}->{$key}->{OrderNumber} = trim($item->{OrderNumber});
			$data->{$item_key}->{$key}->{DeviceClli} = trim($item->{DeviceClli});
			$data->{$item_key}->{$key}->{CktId} = trim($item->{CktId});
			$data->{$item_key}->{$key}->{edgeDeviceID} = trim($item->{edgeDeviceID});
			$data->{$item_key}->{$key}->{orderId} = trim($item->{orderId});
		}
	}

	return $data;
}


sub get_cth {
	my ($record, $data) = @_;


	my $cth_keys = {
		CthFalloutListCnlDetails => 'cth_cnl',
		CthFalloutListAdiDetails => 'cth_adi',
		CthFalloutListUniDetails => 'cth_uni',
		CthFalloutListEvcDetails => 'cth_evc'
	};

	foreach my $cth_type (keys %{$cth_keys}){
		if(my $cth = $record->{Details}->{$cth_type}){
			my $key = $cth_keys->{$cth_type};
			$data->{cth} = {};
			$data->{cth}->{$key} = $cth;
		}
	}

	return $data;
}


sub get_watson {
	my ($record, $data) = @_;

	my $item_key = 'watson';
	my $data_keys = {
		WatsonStatusCnlDetails => 'watson_cnl',
		WatsonStatusAdiDetails => 'watson_adi',
		WatsonStatusUniDetails => 'watson_uni',
		WatsonStatusEvcDetails => 'watson_evc'
	};

	foreach my $data_type (keys %{$data_keys}){
		if(my $item = $record->{Details}->{$data_type}){
			my $key = $data_keys->{$data_type};
			$data->{$item_key} = {};
			$data->{$item_key}->{$key} = $item;
		}
	}

	return $data;
}


sub get_edge_force {
	my ($record, $data) = @_;


	my $edge_keys = {
		EdgeForceCnlDetails => 'edge_cnl',
		EdgeForceAdiDetails => 'edge_adi',
		EdgeForceUniDetails => 'edge_uni',
		EdgeForceEvcDetails => 'edge_evc',
	};

	foreach my $edge_type (keys %{$edge_keys}){

		if(my $edge_force = $record->{Details}->{$edge_type}){
			my $key = $edge_keys->{$edge_type};
			$data->{edge_force} = {};
			$data->{edge_force}->{$key} = ();

			foreach my $edge_data (@{$edge_force}){
				my $edge = {};
				$edge->{WRID} = trim($edge_data->{WRID});
				$edge->{CAC} = trim($edge_data->{CAC});
				$edge->{ORD} = trim($edge_data->{ORD});
				$edge->{FORCE_STAT} = trim($edge_data->{FORCE_STAT});
				$edge->{DSP_CLLI} = trim($edge_data->{DSP_CLLI});
				push @{$data->{edge_force}->{$key}}, $edge;
			}
		}
	}

	return $data;
}