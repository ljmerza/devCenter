import { Component, OnInit, ViewChild, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject, Observable, Subscription } from 'rxjs';
import 'rxjs/add/observable/interval';

import { UserService } from './../../shared/services/user.service';
import { JiraService } from './../../shared/services/jira.service';
import { ToastrService } from './../../shared/services/toastr.service';
import { WebSocketService } from './../../shared/services/web-socket.service';
import { LocalStorageService } from './../../shared/services/local-storage.service';

import { DataTableDirective } from 'angular-datatables';
import { NgProgress } from 'ngx-progressbar';

import { NgRedux } from 'ng2-redux';
import { IAppState, Actions } from './../../shared/store/store';

import { Ticket } from './../../shared/store/models/ticket';
import * as $ from 'jquery';

@Component({
	selector: 'dc-tickets',
	templateUrl: './tickets.component.html',
	styleUrls: ['./tickets.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class TicketsComponent implements OnInit, OnDestroy {
	loadingTickets:boolean = true;
	openTickets:Array<Ticket>;
	ticketType;
	repos;
	searchTicket$;
	webSock$;
	dtTrigger:Subject<any> = new Subject();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;

	dtOptions = {
		order: [[4, 'desc']],
		columnDefs: [
			{targets: [8,9], visible: false},
			{targets: 3, width: '10%'},
			{targets: [4,5,8,9], type: 'date'}
		],
		dom: `
			<'row'<'col-sm-12'Bfl>>
			<'row'<'col-sm-12'tr>>
			<'row'<'col-sm-12'ip>>
		`,
		pageLength: 5,
		lengthMenu: [5, 10, 15, 20, 100],
		buttons: ['colvis', 'excel'],
		stateSave: true,
		pagingType: 'full',
		language: {
			search: "",
        	searchPlaceholder: "Search Ticket",
        	zeroRecords: 'No matching tickets found'
        }
	};

	/*
	*/
	constructor(
		public lStore:LocalStorageService, ngRedux: NgRedux<IAppState>,
		public ngProgress: NgProgress, public route:ActivatedRoute, 
		public jira:JiraService, public user:UserService,
		public toastr: ToastrService, public webSock: WebSocketService
	) {}
	
	/*
	*/
	ngOnInit():void {
		// if we are authed then get list of repos once
		if( !this.user.needRequiredCredentials() ){
			this.jira.getRepos().subscribe( 
				branches => { 
					if(branches) this.repos = branches.data;
				},
				error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
			);
		}

		this.route.paramMap.subscribe( params => {
			// default to my tickets
			this.ticketType = params.get('filter') || 'mytickets';
			// destroy any existing subscriptions
			this.destorySubscritions();
			// if required user info exists then get tickets and repos
			if( !this.user.needRequiredCredentials() ){
				this.searchTicket$ = this.getTickets();
			}
		});
	}

	/*
	*/
	ngOnDestroy(){
		this.destorySubscritions();
	}

	/*
	*/
	destorySubscritions() {
		if(this.searchTicket$) this.searchTicket$.unsubscribe();
		if(this.webSock$) this.webSock$.unsubscribe();
	}

	/*
	*/
	startWebSocket() {

		// create websocket to receive ticket updates - skip first to get 'old' data
		return this.webSock.getTickets()
		.map(data => {

			switch(this.ticketType){
				case 'pcr':
					return data.filter(ticket => ticket.status === 'PCR - Needed');
				case 'qa':
					return data.filter(ticket => ['Ready for QA', 'In QA'].includes(ticket.status) );
				case 'mytickets':
					return data.filter(ticket => ticket.username === this.user.username);
				case 'allopen':
					return data;
				case 'cr':
					return data.filter(ticket => ['PCR - Completed', 'Code Review - Working'].includes(ticket.status) );
			}
		})
		.distinctUntilChanged( (old_tickets, new_tickets) => {
			return JSON.stringify(old_tickets) === JSON.stringify(new_tickets) 
		})
		.skip(1)
		.subscribe( data => {

			// save new tickets locally if my tickets
			if(!this.ticketType || this.ticketType == 'mytickets'){
				this.lStore.setItem('mytickets', JSON.stringify(data));
			}

			this.openTickets = data;
			this.rerender();

		});
	}

	/*
	*/
	getTickets(skipCache=false):Subscription {
		this.ngProgress.start();
		if(!skipCache) this.loadingTickets = false;

		return this.jira.getFilterData(this.ticketType, skipCache)
		.subscribe(issues => {

			if(issues && issues.data) {
				// save tickets and re-render data tables
				this.openTickets = issues.data;
				
				this.ngProgress.done();
				this.loadingTickets = false;
				
				this.rerender();

				// enable websockets
				// if( !this.ticketType || ['pcr','qa','cr','allopen','mytickets'].includes(this.ticketType) ) {
				// 	this.webSock$ = this.startWebSocket();
				// }
			}
		},
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

	/*
	*/
	rerender():void {

		if(this.dtElement && this.dtElement.dtInstance){
			this.dtElement.dtInstance.then( (dtInstance:DataTables.Api) => {
				dtInstance.destroy();
				this.dtTrigger.next();			
			});
		} else {
			this.dtTrigger.next();
		}
	}

	/*
	*/
	pcrPassEvent({key, isTransitioned, showToast=true}):void {

		// if success then remove ticket
		if(isTransitioned){
			this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
				dtInstance.row( $(`#${key}`)[0] ).remove();
				this.rerender();
			});

		}
	}
}
