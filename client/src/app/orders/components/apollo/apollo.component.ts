import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Sort, MatTableDataSource, MatPaginator } from '@angular/material';
import { Store, select } from '@ngrx/store';
import { distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { ApolloService } from '../../services';

import { NotificationService } from '@app/core/notifications/notification.service';
import { ProfileService } from '@app/core/profile';

import { ActionSettingsPersist } from '@app/settings/settings.actions';
import { ColumnDefinition } from '@app/settings/settings.model';
import { selectSettings } from '@app/settings/settings.selectors';

@Component({
  selector: 'dc-apollo',
  templateUrl: './apollo.component.html',
  styleUrls: ['./apollo.component.css']
})
export class ApolloComponent implements OnInit, OnDestroy {
  loading = false;
  loadingIcon = false;
  orders = [];
  filterValue = '';

  orders$: Subscription;
  settings$: Subscription;
  settings;

  columnDefinitions: ColumnDefinition[] = [];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private apolloService: ApolloService, private notifications: NotificationService, public store: Store<{}>, public profileService: ProfileService) { }

  ngOnInit() {
    this.getOrders();
    this.getOrderColumns();
  }

  getOrderColumns(){
    this.settings$ = this.store
      .pipe(
        select(selectSettings),
        distinctUntilChanged((prev, next) => prev.apolloColumnDefinitions === next.apolloColumnDefinitions)
      )
      .subscribe(state => (this.settings = state));
  }

  getOrders(){
    if (this.apolloService.cachedApolloOrders) {
      this.processOrders();

    } else {
      this.loading = true;
      this.loadingIcon = true;

      this.orders$ = this.apolloService.getApolloOrders().subscribe(
        (response: any) => {
          this.apolloService.cachedApolloOrders = response.data;
          this.processOrders();

        },
        response => {
          this.notifications.error(`Could not get Apollo orders: ${response.error.data}`);
        },
        () => {
          this.loading = false;
          this.loadingIcon = false;
        }
      );
    }
  }

  /**
   * saves order data and configures the UI table
   */
  processOrders(){
    this.orders = this.apolloService.cachedApolloOrders.map(this.processAtxData.bind(this));

    this.loading = false;
    this.loadingIcon = false;

    // create sorted material table array
    this.sortData({ active: 'UNI CLO', direction: 'desc' }, this.orders);
  }

  /**
   * 
   * @param {Object} order
   * @return {Object}
   */
  processAtxData(order){
    if (order.ATX && order.ATX.length && order.ATX[0].atx && order.ATX[0].atx.AtxUniUso){
      let ports = 0;
      let pvcs = 0;
      let lecCircuitIds = [];
      let icoreOrderIds = [];

      order.ATX.forEach(atx => {
        if(atx.atx_route.PORTS) {
          ports += atx.atx_route.PORTS.length;
          atx.atx_route.PORTS.forEach(atxRecord => this.atxRecordProcessing({atxRecord, lecCircuitIds, icoreOrderIds}));
        }

        if(atx.atx_route.PVCS) {
          pvcs += atx.atx_route.PVCS.length;
          atx.atx_route.PVCS.forEach(atxRecord => this.atxRecordProcessing({atxRecord, lecCircuitIds, icoreOrderIds}));
        }

      });

      order.atxRecord = {ports, pvcs, lecCircuitIds, icoreOrderIds};
      console.log({ atxRecord2: order.atxRecord });
      
    }

    return order
  }

  /**
   * 
   */
  atxRecordProcessing({atxRecord, lecCircuitIds, icoreOrderIds}){
    console.log({ atxRecord });
    
    if(atxRecord.access_details && atxRecord.access_details.firmOrder){
      atxRecord.firmOrder.forEach(firm => {
        lecCircuitIds.push(firm.lecCircuitId);
      });
    }
    
    const icore_id = atxRecord.efms && 
      atxRecord.efms.svcOrder && 
      atxRecord.efms.svcOrder.orderExtension && 
      atxRecord.efms.svcOrder.orderExtension.icoreOrderId;

    const icore_usrp_id = atxRecord.usrp && 
      atxRecord.usrp.order && 
      atxRecord.usrp.order.activity && 
      atxRecord.usrp.order.activity.icoreOrderNumber;

    if (icore_id || icore_usrp_id) {
      icoreOrderIds.push(icore_id || icore_usrp_id);
    }
  }

  /**
	 * track by function for table
	 * @param index
	 * @param ticket
	 */
  trackTableBy(index, ticket) {
    return ticket.key;
  }

  /**
	 * cancels the current request to get tickets
	 */
  cancelGetOrders() {
    this.loading = false;
    this.loadingIcon = false;
    // this.ticketEffects.cancelSearchJiraTicket();
  }

  ngOnDestroy(): void {
    this.orders$ && this.orders$.unsubscribe();
    this.settings$ && this.settings$.unsubscribe();
  }

  get displayedColumns(): string[] {
    return (this.apolloColumnDefinitions || []).filter(cd => cd.display).map(cd => cd.name);
  }

  set displayedColumns(value) {
    console.log({ value });
  }

  get apolloColumnDefinitions() {
    return (this.settings || {}).apolloColumnDefinitions || [];
  }

  /**
	 * change the user settings for which columns show on the ticket table
	 * @param {string} value array of columns to show
	 */
  changeShown({ value }) {
    const newColumnDefinitions = this.apolloColumnDefinitions.map(cd => {
      cd = { ...cd };
      cd.display = value.includes(cd.name);
      return cd;
    });

    this.store.dispatch(new ActionSettingsPersist({ ...this.settings, apolloColumnDefinitions: newColumnDefinitions }));
  }

  /**
	 * reset the mat table values
	 */
  resetTable() {
    this.filterValue = '';
    this.paginator.pageIndex = 0;
  }

  /**
	 * table filtering function
	 * @param filterValue
	 */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
	 * adds sort functionality
	 * @param sort
	 */
  sortData(sort: Sort, data: any = '') {
    data = data || this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') return;

    data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';

      switch (sort.active) {
      case 'UNI CLO':
          return this.compare(a.UNI && a.UNI[0].WfaClo, b.UNI && b.UNI[0].WfaClo, isAsc);
      case 'UNI Circuit':
        return this.compare(a.UNI && a.UNI[0].BpoCktId, b.UNI && b.UNI[0].BpoCktId, isAsc);
      case 'UNI Region':
        return this.compare(a.UNI && a.UNI[0].WfaRegion, b.UNI && b.UNI[0].WfaRegion, isAsc);
      case 'UNI OSSOI Order':
        return this.compare(a.UNI && a.UNI[0].wfa_uni && a.UNI[0].wfa_uni.ORD, b.UNI && b.UNI[0].wfa_uni && b.UNI && b.UNI[0].wfa_uni.ORD, isAsc);
      case 'UNI Open Events':
        return this.compare(a.UNI && a.UNI[0].wfa_uni &&a.UNI[0].wfa_uni.open_events && a.UNI && a.UNI[0].wfa_uni.open_events.length, b.UNI && b.UNI[0].wfa_uni && b.UNI && b.UNI[0].wfa_uni.open_events && b.UNI && b.UNI[0].wfa_uni.open_events.length, isAsc);
      case 'UNI aseDB':
        return this.compare(a.UNI && a.UNI[0].AsedbSiteId, b.UNI && b.UNI[0].AsedbSiteId, isAsc);
      case 'UNI OMX / OCX':
        return this.compare(a.UNI && a.UNI[0].OmxOrderId, b.UNI && b.UNI[0].OmxOrderId, isAsc);
      case 'UNI Edge Forces':
          return this.compare(a.UNI && a.UNI[0].edge_uni && a.UNI[0].edge_uni.length, b.UNI && b.UNI[0].edge_uni && b.UNI && b.UNI[0].edge_uni.length, isAsc);
      case 'UNI PO':
        return this.compare(a.UNI_pos && a.UNI_pos.length, b.UNI_tos && b.UNI_tos.length, isAsc);
      case 'UNI TO':
        return this.compare(a.UNI_tos && a.UNI_tos.length, b.UNI_tos && b.UNI_tos.length, isAsc);
      case 'UNI ACTS':
        return this.compare(a.UNI && a.UNI[0].is_acts, b.UNI && b.UNI[0].is_acts, isAsc);
      case 'UNI EAN':
        return this.compare(a.UNI && a.UNI[0].is_ean, b.UNI && b.UNI[0].is_ean, isAsc);
      case 'UNI Devices':
        return this.compare(a.UNI && a.UNI[0].canopi && a.UNI[0].canopi.uni_to, b.UNI && b.UNI[0].canopi && b.UNI && b.UNI[0].canopi.uni_to, isAsc);
      case 'UNI PON':
          return this.compare(a.UNI && a.UNI[0].ExactPon || a.database_info && a.database_info.PON, b.UNI && b.UNI[0].ExactPon || b.database_info && b.database_info.PON, isAsc);

      case 'CNL CLO':
        return this.compare(a.CNL && a.CNL[0].WfaClo, b.CNL && b.CNL[0].WfaClo, isAsc);
      case 'CNL Circuit':
        return this.compare(a.CNL && a.CNL[0].BpoCktId, b.CNL && b.CNL[0].BpoCktId, isAsc);
      case 'CNL Region':
        return this.compare(a.CNL && a.CNL[0].WfaRegion, b.CNL && b.CNL[0].WfaRegion, isAsc);
      case 'CNL OSSOI Order':
          return this.compare(a.CNL && a.CNL[0].wfa_cnl && a.CNL[0].wfa_cnl.ORD, b.CNL && b.CNL[0].wfa_cnl && b.CNL[0].wfa_cnl.ORD, isAsc);
      case 'CNL Open Events':
          return this.compare(a.CNL && a.CNL[0].wfa_cnl && a.CNL[0].wfa_cnl.open_events && a.CNL[0].wfa_cnl.open_events.length, b.CNL && b.CNL[0].wfa_cnl && b.CNL[0].wfa_cnl.open_events &&  b.CNL[0].wfa_cnl.open_events.length, isAsc);
      case 'CNL aseDB':
        return this.compare(a.CNL && a.CNL[0].AsedbSiteId, b.CNL && b.CNL[0].AsedbSiteId, isAsc);
      case 'CNL Edge Forces':
        return this.compare(a.CNL && a.CNL[0].edge_cnl && a.CNL[0].edge_cnl.length, b.CNL && b.CNL[0].edge_cnl && b.CNL[0].edge_cnl.length, isAsc);
      case 'CNL PO':
        return this.compare(a.CNL_pos && a.CNL_pos.length, b.CNL_pos && b.CNL_pos.length, isAsc);
      case 'CNL TO':
        return this.compare(a.CNL_tos && a.CNL_tos.length, b.CNL_tos && b.CNL_tos.length, isAsc);
      case 'CNL Devices':
        return this.compare(a.CNL && a.CNL[0].canopi && a.CNL[0].canopi.cnl_to, b.CNL && b.CNL[0].canopi && b.CNL[0].canopi.cnl_to, isAsc);
      case 'CNL PON':
          return this.compare(a.CNL && a.CNL[0].ExactPon || a.database_info && a.database_info.PON, b.CNL && b.CNL[0].ExactPon || b.database_info && b.database_info.PON, isAsc);

      case 'EVC CLO':
          return this.compare(a.EVC && a.EVC[0].WfaClo, b.EVC && b.EVC[0].WfaClo, isAsc);
      case 'EVC Circuit':
        return this.compare(a.EVC && a.EVC[0].BpoCktId, b.EVC && b.EVC[0].BpoCktId, isAsc);
      case 'EVC Region':
        return this.compare(a.EVC && a.EVC[0].WfaRegion, b.EVC && b.EVC[0].WfaRegion, isAsc);
      case 'EVC OSSOI Order':
        return this.compare(a.EVC && a.EVC[0].wfa_evc && a.EVC[0].wfa_evc.ORD, b.EVC && b.EVC[0].wfa_evc && b.EVC[0].wfa_evc.ORD, isAsc);
      case 'EVC Open Events':
        return this.compare(a.EVC && a.EVC[0].wfa_evc && a.EVC[0].wfa_evc.open_events && a.EVC[0].wfa_evc.open_events.length, b.EVC && b.EVC[0].wfa_evc && b.EVC[0].wfa_evc.open_events && b.EVC[0].wfa_evc.open_events.length, isAsc);
      case 'EVC aseDB':
        return this.compare(a.EVC && a.EVC[0].AsedbSiteId, b.EVC && b.EVC[0].AsedbSiteId, isAsc);
      case 'EVC Edge Forces':
        return this.compare(a.EVC && a.EVC[0].edge_evc && a.EVC[0].edge_evc.length, b.EVC && b.EVC[0].edge_evc && b.EVC[0].edge_evc.length, isAsc);
      case 'EVC PO':
        return this.compare(a.EVC_pos && a.EVC_pos.length, b.EVC_pos && b.EVC_pos.length, isAsc);
      case 'EVC TO':
        return this.compare(a.EVC_tos && a.EVC_tos.length, b.EVC_tos && b.EVC_tos.length, isAsc);
      case 'EVC PON':
          return this.compare(a.EVC && a.EVC[0].ExactPon || a.database_info && a.database_info.PON, b.EVC && b.EVC[0].ExactPon || b.database_info && b.database_info.PON, isAsc);

      case 'ATX Site ID':
        return this.compare(a.ATX && a.ATX[0].atx && a.ATX[0].atx.AsedbSiteId, b.ATX && b.ATX[0].atx && b.ATX[0].atx.AsedbSiteId, isAsc);
      case 'ATX PON':
        return this.compare(a.ATX && a.ATX[0].atx && a.ATX[0].atx.AtxUniPon, b.ATX && b.ATX[0].atx && b.ATX[0].atx.AtxUniPon, isAsc);
      case 'ATX USO':
        return this.compare(a.ATX && a.ATX[0].atx && a.ATX[0].atx.AtxUniUso, b.ATX && b.ATX[0].atx && b.ATX[0].atx.AtxUniUso, isAsc);
      case 'ATX iCore':
        return this.compare(a.ATX && a.ATX[0].atx && a.ATX[0].atx.AtxUniUsoIcoreId, b.ATX && b.ATX[0].atx && b.ATX[0].atx.AtxUniUsoIcoreId, isAsc);

      case 'ADE CLO':
        return this.compare(a.ADE && a.ADE[0].WfaClo, b.ADE && b.ADE[0].WfaClo, isAsc);
      case 'ADE Circuit':
        return this.compare(a.ADE && a.ADE[0].BpoCktId, b.ADE && b.ADE[0].BpoCktId, isAsc);
      case 'ADE Region':
        return this.compare(a.ADE && a.ADE[0].WfaRegion, b.ADE && b.ADE[0].WfaRegion, isAsc);

        default:
          return 0;
      }
    });

    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
  }

	/**
	 * basic comparitor for sorting
	 * @param a
	 * @param b
	 * @param isAsc
	 */
  compare(a: number | string, b: number | string, isAsc: boolean) {
    if (a && !b) return (isAsc ? 1 : -1);
    if (b && !a) return (isAsc ? -1 : 1);
    
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}
