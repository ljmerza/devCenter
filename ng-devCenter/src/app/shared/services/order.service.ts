import { Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable()
export class OrderService {

	constructor(private dataService:DataService) { }

	url = 'http://ud.web.att.com/UD/cgi-bin/ajaxFuncs.pl?ajaxAction=getWorklist';

	fields = ['Core.acna_CustName','Core.ACTSFLAG','Core.ANR','Core.ASEdb_CNL_PP_Invoked','Core.ASEdb_Esc','Core.ASEdb_IR','Core.ASEdb_SiteID','Core.ATX_Prod','Core.CANOPI_CNL_TO','Core.CANOPI_CNL_TO_OrderStatus','Core.CANOPI_CNL_TO_ProvStat','Core.CANOPI_DiversityIndicator','Core.CANOPI_MULTI_UNI','Core.CANOPI_OrderStatus','Core.CANOPI_SiteType','Core.CANOPI_UNI_PO','Core.CKTID_PARSE','Core.CNL_CAC','Core.CNL_CKTID_PARSE','Core.CNL_Status','Core.CNL_TRK','Core.CNR','Core.DD_Status','Core.EVC_Status','Core.Exact_Status','Core.FCD_Status','Core.FOC','Core.ICSC','Core.JEP_CODEX','Core.LOA','Core.Manager','Core.MCMULLAN_Type','Core.MSRD','Core.OrdNum','Core.POS_Name','Core.Product_Type','Core.PTD_Status','Core.RC_Supervisor','Core.SCR_CMP','Core.SPEC','Core.Sub_Class','Core.Supervisor_CLF','Core.SWITCH_TYPE','Core.system','Core.VT_Status','Core.WOT_Status','Core.WSD_Status','Core.WvR','Core.XMLFEtxt','Core.ZOSD_MOD','Emp.SupvrATTUID','Refresh.acna','Refresh.act','Refresh.ALOC','Refresh.AppDate','Refresh.ASR','Refresh.BTN','Refresh.cac','Refresh.CDDD','Refresh.CENT','Refresh.CKR','Refresh.cktfmt','Refresh.cktid','Refresh.cmp_dt','Refresh.comments','Refresh.csu','Refresh.ctr','Refresh.cust','Refresh.DLRDact','Refresh.DLRDobj','Refresh.DPROC','Refresh.DREC','Refresh.event_type','Refresh.flc','Refresh.group_id','Refresh.ICENT','Refresh.id','Refresh.jeop','Refresh.jeop2','Refresh.jeop3','Refresh.LAMact','Refresh.LAMobj','Refresh.lastjep','Refresh.lataid','Refresh.mcn','Refresh.MCO','Refresh.mgr','Refresh.obj_dt','Refresh.oco','Refresh.OCS','Refresh.OrgID','Refresh.OrigDD','Refresh.ot','Refresh.P1_Addr','Refresh.P1_WFAWC','Refresh.P2_Addr','Refresh.P2_WFAWC','Refresh.PON','Refresh.pos','Refresh.prjid','Refresh.RCV_DT','Refresh.REGION','Refresh.RIDact','Refresh.RIDobj','Refresh.RO','Refresh.schd_dt','Refresh.SIDact','Refresh.SIDobj','Refresh.SLSS','Refresh.srvtype','Refresh.stat','Refresh.STATE','Refresh.tirks_status','Refresh.trk','Refresh.TSP','Refresh.WIP','Refresh.ZLOC','Refresh.ZOSD','WL.priority','WL.rmkz'];

	queryStrings = {
		querynumber: 1494,
		BMP: 1,
		EM: 1,
		IVR: 1,
		NCT: 1,
		SNMP: 1,
		ET: 1,
		MSRP: 1,
		OT: 1,
		UC: 0,
		PNCD1: 0,
		CE: 0,
		MWMST: 0,
		LRAP: 0,
		ATIP: 0,
		DI: 0
	};

	/**
	 *
	 */
	getFullUrl(){
		let queryString = '';

		for(let q in this.queryStrings){
			queryString += `&${q}=${this.queryStrings[q]}`;
		}

		const fields = this.fields.join(',');
		return `${this.url}${queryString}&fields=${fields}&allFields=${fields}`;
	}

	/**
	 *
	 */
	getOrders(){
		return this.dataService.get( this.getFullUrl() );
	}

	/**
	 *
	 */
	processErrorResponse(message){
		return this.dataService.processErrorResponse(message);
	}

}
