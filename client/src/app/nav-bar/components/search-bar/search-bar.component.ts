import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';

import { environment as env } from '@env/environment';
import { selectSettings } from '@app/settings/settings.selectors';
import { ActionSearch, ActionOpenTicket } from '../../nav-bar.actions';
import { NotificationService } from '@app/core/notifications/notification.service';

@Component({
  selector: 'dc-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SearchBarComponent implements OnInit {
  private settings$: Subscription;
  settings;
  env = env;

  formValues = {
    inputValue: '',
    searchType: 'Jira',
    secondSearchType: '',
  };
  selectedSearchOption;

  @Input() emberBaseUrl:string = '';

  validFormValues:Array<any> = [
    {
      name: 'Jira', // used to select which method to call
      buttonName: 'Search', // search button text
      placeholder: 'Search Jira Ticket', // input placeholder text
      caller: 'searchTicket' // method name to be called when searching
    },
    {
      name: 'ATX',
      buttonName: 'Open ATX',
      placeholder: 'ATX Order',
      caller: 'openWorkitem',
      url: 'order/atx', // url piece to use in ember
      secondDropdown: [
        {name: 'USO', value: 'usoNumber'},
        {name: 'SR', value: 'svcRequestName'},
        {name: 'PON', value: 'ponNumber'},
        {name: 'Package Name', value: 'packageName'},
        {name: 'OCX Order Number', value: 'ocxOrderNumber'},
        {name: 'Circuit ID', value: 'attCircuitId'},
        {name: 'iCore PVC ID', value: 'PVCId'},
        {name: 'iCore Site ID', value: 'SiteId'},
      ],
      secondValue: 'usoNumber'
    },
    {
      name: 'Order',
      buttonName: 'Open Order',
      placeholder: 'Apollo Order',
      caller: 'openWorkitem',
      url: 'order/ethernet' // url piece to use in ember
    },
    {
      name: 'BMP',
      buttonName: 'Open BMP',
      placeholder: 'BMP Ticket',
      caller: 'openWorkitem',
      url: 'ticket/bmp'
    },
    {
      name: 'Ticket',
      buttonName: 'Open Ticket',
      placeholder: 'WFA Ticket',
      caller: 'openWorkitem',
      url: 'ticket/ethernet'
    },
    {
      name: 'RDS Package',
      buttonName: 'Open RDS',
      placeholder: 'RDS Package',
      caller: 'openWorkitem',
      url: 'order/rds'
    }
  ];

  constructor(public store: Store<{}>, private notificationsService: NotificationService) {}

  ngOnInit(){
    this.selectedSearchOption = this.validFormValues[0];

    // get settings
    this.settings$ = this.store.pipe(select(selectSettings))
      .subscribe(settings => (this.settings = settings));
  }

  ngOnDestroy(): void {
    this.settings$.unsubscribe();
  }

  /**
   * Searches for a Jira ticket by key or MSRP. If ticket found opens in new tab.
   */
  searchTicket():void {
    if(!this.formValues.inputValue){
      this.notificationsService.error('MSRP or Jira key required to lookup a ticket');
      return;
    }

    if(isNaN(parseInt(this.formValues.inputValue))){
      this.store.dispatch(new ActionOpenTicket(this.formValues.inputValue));

    } else {
      this.store.dispatch(new ActionSearch(this.formValues.inputValue));
    }

    this.formValues.inputValue = '';
  }

  /**
   * Opens a workitem in dev Ember.
   */
  private openWorkitem():void {
    if(!this.formValues.inputValue){
      this.notificationsService.error(`${this.selectedSearchOption.placeholder} is required`);
      return;
    }

    // add second url if given
    const secondaryUrl = this.formValues.secondSearchType ?  `/${this.formValues.secondSearchType}` : '';
    const link = `${this.emberBaseUrl}/${this.selectedSearchOption.url}${secondaryUrl}/${this.formValues.inputValue}`;

    const queryAddition = link.includes('?') ? '&' : '?';
    const fullUrl = `${link}${queryAddition}cache=${this.settings.cache ? 1 : ''}`;
    window.open(fullUrl);
    this.formValues.inputValue = '';
  }

  /**
   * Processes the navbar input form.
   * @param {NgForm} formObj
   */
  onSubmit():void {
    this[this.selectedSearchOption.caller]();
  }

  /**
   * Changes the form input type.
   * @param {Event} $event
   */
  changeInputType($event):void {
    this.selectedSearchOption = this.validFormValues.find(optionType => $event.value === optionType.name);

    // if selected search option has second dropdown then set default as first selection
    const secondDropdown = this.selectedSearchOption.secondDropdown;
    this.formValues.secondSearchType = secondDropdown ? secondDropdown[0].value : '';
  }
}
