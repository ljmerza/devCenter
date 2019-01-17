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
use Parallel::ForkManager;

use M5::DB;
use OMX;
use M5::REST::WATSON::ODB;
use M5::REST::WATSON::ACTS;
use M5::REST::WATSON::Canopi;

##############################
my $number_of_orders = 500;
##############################

my $dirname = 'data';
my $output = "$dirname/deep_order_data2.json";
make_path($dirname, {chmod => 0777});

sub db_connect_odb_ro {
	my ($class) = @_;
	return M5::DB->connect(
		db => 'odb',
		mode => 'read',
		use_prod => 1
	);
}

sub trim { 
	my $s = shift; 
	return '' if(not $s or $s =~ /null/i);
	$s =~ s/^\s+|\s+$//g; 
	return $s 
};

my $dbh = db_connect_odb_ro();
my $processing = 0;
my $processed = 0;
my @deep_order_data = ();
my @recorded_orders = ();


my $sql = ";
SELECT DISTINCT SRC FROM ODB.dbo.CORE_ENOC1CENTER_DB2 as Core 
right join odb.dbo.DB2_Feeds_Refresh as Refresh on Core.cktid = Refresh.cktid";

my $sth = $dbh->prepare($sql);
$sth->execute();
my $regions = $sth->fetchall_arrayref({});

my $orders_per_region = int($number_of_orders / scalar @{$regions});
print "$orders_per_region orders per region\n";

foreach my $region (@{$regions}){
	$region = trim($region->{SRC});
	next unless $region;

	my $sql = ";
SELECT TOP $orders_per_region * FROM ODB.dbo.CORE_ENOC1CENTER_DB2 as Core right 
join odb.dbo.DB2_Feeds_Refresh as Refresh on Core.cktid = Refresh.cktid 
and Core.event_type = Refresh.event_type AND Refresh.cmp_dt is NULL AND SRC = '$region'";

	my $sth = $dbh->prepare($sql);
	$sth->execute();
	my $order_data = $sth->fetchall_arrayref({});
	dump_data($order_data);
}



sub dump_data {
	my $order_data = shift;
	my $max_forks = 20;
	my $pfm = Parallel::ForkManager->new($max_forks,'/opt/PFM');


	$pfm->run_on_finish(sub {
		my ($pid, $exit_code, $ident, $exit_signal, $core_dump, $hash) = @_;
		push @deep_order_data, $hash->{order};
		$processed = $processed + 1;
		print("processed order $processed. Currently at $processing out of $number_of_orders orders total\n");
	});

	foreach my $order (@{$order_data}){
		my $trk = $order->{trk};
		$processing = $processing + 1;

		next if(not $trk or grep(/^$trk$/, @recorded_orders));
		push @recorded_orders, $trk;

		$pfm->start and next;
		my $order_number = $order->{OrdNum};
		my $formatted_records = {};

		my $ODB = M5::REST::WATSON::ODB->new();
		my $response = $ODB->get_orders(fuzzy_order => $trk, deep => 1);


		if('HASH' eq ref $response and $response->{OdbRecordList}) {
			$formatted_records = process_order($response->{OdbRecordList}, 'CLO');
			$formatted_records->{database_info} = $order;
		}


		$pfm->finish(0, {order => $formatted_records});
	}


	$pfm->wait_all_children;
}


# create JSON dump
open my $fh, ">", $output or die "Cannot open file '$output': $!\n";
print $fh encode_json(\@deep_order_data);
close $fh;








sub add_order_to_list {
	
}


sub process_order {
	my ($odb_records, $type) = @_;

	my $formatted_records = {};

	foreach my $record (@{$odb_records}){
		my $component_type = $record->{BpoComponent};

		# general Order data
		my $BpoCktId = trim($record->{BpoCktId});
		my $letter = substr($BpoCktId, 0, 1);

		my $data = {
			WfaClo => trim($record->{WfaClo}),
			BpoCktId => $BpoCktId,
			BpoCktIdURL => $letter eq '/' ? substr($BpoCktId, 1) : $BpoCktId,
			WfaRegion => trim($record->{WfaRegion}),
			AsedbSiteId => trim($record->{AsedbSiteId}),
			CanopiPo => trim($record->{CanopiPo}),
			CanopiTo => trim($record->{CanopiTo}),
			ExactPon => trim($record->{ExactPon}),
			OmxOrderId => trim($record->{OmxOrderId}),
		};

		if($component_type eq 'ATX'){
			$data = get_atx($record, $data);

		} else {
			$data = get_asedb($record, $data);
			$data = get_canpoi($record, $data, $type);
			$data = get_edge_force($record, $data);
			$data = get_wfa_details($record, $data);
			$data = get_omx_ocx($record, $data);
			$data = get_cth($record, $data);
			$data = get_watson($record, $data);

			my $circuit_type = $component_type;
			$data->{canopi_data} = get_po_to_data(circuit_id => $data->{BpoCktId}, clo => $data->{WfaClo}, circuit_type => $circuit_type);
		}

		if($component_type eq 'UNI'){
			$data = get_acts($record, $data);
			$data = is_ean($record, $data);
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
			$data->{$key} = {};

			$data->{$key}->{ALOC} = trim($wfa->{ALOC});
			$data->{$key}->{ZLOC} = trim($wfa->{ZLOC});
			$data->{$key}->{ORD} = trim($wfa->{ORD});
			$data->{$key}->{CAC} = trim($wfa->{CAC});
			$data->{$key}->{ACT} = trim($wfa->{ACT});
			$data->{$key}->{RO} = trim($wfa->{RO});

			if($wfa->{EVENT_LIST} and scalar @{$wfa->{EVENT_LIST}}){
				$data->{$key}->{events} = ();
				$data->{$key}->{open_events} = ();

				foreach my $event (@{$wfa->{EVENT_LIST}}){
					my $event_item = {};
					$event_item->{CMP} = trim($event->{CMP});
					$event_item->{EVT} = trim($event->{EVT});
					$event_item->{JEP1} = trim($event->{JEP1});
					$event_item->{JEP2} = trim($event->{JEP2});
					$event_item->{JEP3} = trim($event->{JEP3});

					# check for open events
					if(not $event_item->{CMP} and ($event_item->{JEP1} or $event_item->{JEP2} or $event_item->{JEP3} )){
						push @{$data->{$key}->{open_events}}, $event_item;
					}

					push @{$data->{$key}->{events}}, $event_item;
				}
			}
		}
	}

	return $data;
}

sub get_atx {
	my ($record, $data) = @_;

	if(my $atx = $record->{Details}){

		if($record->{Details}->{AtxUniUso}) {
			$record->{Details}->{AtxUniUso} =~ s/[^0-9]*//g;
		}
		
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

	$data->{is_acts} = $data->{is_acts} ? 'Yes' : 'No';
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

	$data->{is_ean} = $data->{is_ean} ? 'Yes' : 'No';
	return $data;
}


sub get_omx_ocx {
	my ($record, $data) = @_;

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
			$data->{$key} = {};

			$data->{$key}->{contractId} = trim($item->{contractId});
			$data->{$key}->{OrderNumber} = trim($item->{OrderNumber});
			$data->{$key}->{DeviceClli} = trim($item->{DeviceClli});
			$data->{$key}->{CktId} = trim($item->{CktId});
			$data->{$key}->{edgeDeviceID} = trim($item->{edgeDeviceID});
			$data->{$key}->{orderId} = trim($item->{orderId});
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

	my $data_keys = {
		WatsonStatusCnlDetails => 'watson_cnl',
		WatsonStatusAdiDetails => 'watson_adi',
		WatsonStatusUniDetails => 'watson_uni',
		WatsonStatusEvcDetails => 'watson_evc'
	};

	foreach my $data_type (keys %{$data_keys}){
		if(my $item = $record->{Details}->{$data_type}){
			my $key = $data_keys->{$data_type};
			$data->{watson} = {};
			$data->{watson}->{$key} = $item;
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
			$data->{$key} = ();

			foreach my $edge_data (@{$edge_force}){
				my $edge = {};
				$edge->{WRID} = trim($edge_data->{WRID});
				$edge->{CAC} = trim($edge_data->{CAC});
				$edge->{ORD} = trim($edge_data->{ORD});
				$edge->{FORCE_STAT} = trim($edge_data->{FORCE_STAT});
				$edge->{DSP_CLLI} = trim($edge_data->{DSP_CLLI});
				push @{$data->{$key}}, $edge;
			}
		}
	}

	return $data;
}


sub get_po_to_data {
	my (%args) = @_;

	unless($args{circuit_type} && ($args{circuit_id} || $args{clo})){
		return 0;
	}

	my $circuit_type = uc($args{circuit_type});
	my $clo = uc $args{clo} ;
	my $circuit_id = uc $args{circuit_id} ;

	my $canopi = M5::REST::WATSON::Canopi->new();
	my $canopi_labels = {CNL => 'CNL', UNI => 'UNI', EVC => 'EVC', XLATA => 'XLATA_EVC'};
	my $canopi_label = $canopi_labels->{$circuit_type};

	unless($canopi_label){
		print "invalid label for circuit type $circuit_type\n";
		return {po => {}, to => {}};
	}
	    
	if($circuit_id){
		$circuit_id =~ s/^\s+|\s+\Z//g; #trim the circuit data
		$circuit_id =~ s/\/+|\s+\//_/g;
	}

	return {
		po => _get_po_data(circuit_type => $circuit_type, circuit_id => $circuit_id, canopi_label => $canopi_label, canopi => $canopi),
		to => _get_to_data(circuit_type => $circuit_type, circuit_id => $circuit_id, canopi_label => $canopi_label, canopi => $canopi)
	};
}

sub _get_po_data {
	my (%args) = @_;

	my $circuit_type = $args{circuit_type};
	my $canopi_label = $args{canopi_label};
	my $circuit_id = $args{circuit_id};
	my $canopi = $args{canopi};
	my $return_data = {};

	my $po_summary_types = {UNI => 'unicktid', EVC => 'evccktid', XLATA_EVC => 'evccktid'};
	my $canopi_types = {UNI => 'unifiber', EVCP2P => 'evcp2p', EVCMPT => 'evcmpt', XLATA_EVCP2P => 'evcp2p', XLATA_EVCMPT => 'evcmpt'}; 

	# get PO data
	if(defined $po_summary_types->{$canopi_label} and $circuit_id) {
		my $summary = $canopi->get_project_order_summary(
			circuit_id => $circuit_id,
			circuit_type => $po_summary_types->{$canopi_label}
		);

		# get PO details and action items
		if('HASH' eq ref $summary and 'ARRAY' eq ref $summary->{OrderList}) {
			$return_data->{po_summary} = $summary;
			$return_data->{canopi_details} = ();

			foreach(@{ $summary->{OrderList} }) {
				my $po_number = $_->{parentProjectOrderId};
	
				# EVC PO doesn't have parentProjectOrderId
				$po_number = $_->{orderId} if $canopi_label eq 'EVC' or $canopi_label eq 'UNI';
				if($po_number and defined $canopi_types->{$circuit_type}) {

					my $canopi_details = $canopi->get_project_order_details(
						circuit_type => $canopi_types->{$circuit_type},
						po_number => $po_number
					);

					# get action items
					if(defined $canopi_details) {
						my $canopi_actions = $canopi->get_action_items(
							po_or_to => 'po',
							order_number => $po_number
						);
						$return_data->{canopi_actions} = $canopi_actions;

						# get IPAG
						if($canopi_label eq 'UNI' and $canopi_details->{ipagRouterClli}){
							$canopi_details->{ipag_details} = $canopi->get_ipag_details(clli => $canopi_details->{ipagRouterClli});
						}
					}

					# save all canopi data gotten back
					push @{$return_data->{canopi_details}}, $canopi_details;
				}
			}
		}
	}

	return $return_data;
}

sub _get_to_data {
	my (%args) = @_;

	my $circuit_type = $args{circuit_type};
	my $canopi_label = $args{canopi_label};
	my $circuit_id = $args{circuit_id};
	my $canopi = $args{canopi};
	my $return_data = {};

	my $canopi_types = {CNL => 'cnl', UNI => 'unifiber', EVCP2P => 'evcp2p', EVCMPT => 'evcmpt', XLATA_EVCP2P => 'evcp2p', XLATA_EVCMPT => 'evcmpt'};
	my $to_summary_types = {CNL => 'cnlcktid', UNI => 'unicktid', EVC => 'evccktid', XLATA_EVC=> 'evccktid'};

	# if we don't have circuit id , we can't search technical summary
	if(defined $to_summary_types->{$canopi_label} and $circuit_id) {
		my $summary = $canopi->get_technical_order_summary(
			circuit_id => $circuit_id,
			circuit_type => $to_summary_types->{$canopi_label}
		);

		if('HASH' eq ref $summary and 'ARRAY' eq ref $summary->{OrderList}) {
			$return_data->{to_summary} = $summary;
			$return_data->{canopi_details} = ();

			foreach (@{ $summary->{OrderList} }) {
				my $to_number = $_->{orderId};

				if($to_number and defined $canopi_types->{$circuit_type}) {
					my $canopi_details = $canopi->get_technical_order_details(
						circuit_type => $canopi_types->{$circuit_type},
						to_number => $to_number
					);

					if(defined $canopi_details) {
						my $canopi_actions = $canopi->get_action_items(
							po_or_to => 'to',
							order_number => $to_number
						);
						$return_data->{canopi_actions} = $canopi_actions;

						# Get IPAG details for UNI or CNL circuits and if canopi has a clli
						if(grep {$canopi_label eq $_} qw! CNL UNI ! and $canopi_details->{ipagRouterClli}){
							$canopi_details->{ipag_details} = $canopi->get_ipag_details(clli => $canopi_details->{ipagRouterClli});
						}
					}

					# save all canopi data gotten back
					push @{$return_data->{canopi_details}}, $canopi_details;
				}
			}
		}
	}

	return $return_data;
}