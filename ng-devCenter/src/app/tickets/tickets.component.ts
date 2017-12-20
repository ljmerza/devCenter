import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject, Observable, Subscription } from 'rxjs';
import 'rxjs/add/observable/interval';

import { UserService } from './../services/user.service';
import { JiraService } from './../services/jira.service';
import { ToastrService } from './../services/toastr.service';
import { WebSocketService } from './../services/web-socket.service';

import { DataTableDirective } from 'angular-datatables';
import { NgProgress } from 'ngx-progressbar';

import * as $ from 'jquery';

@Component({
	selector: 'app-tickets',
	templateUrl: './tickets.component.html',
	styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit, OnDestroy {
	loadingTickets:boolean = true;
	openTickets:Array<any>;

	searchTicket$;
	webSock$;

	ticketType;
	repos;
	dtTrigger:Subject<any> = new Subject();

	@ViewChild(DataTableDirective) private dtElement: DataTableDirective;

	dtOptions = {
		order: [[4, 'desc']],
		columnDefs: [
			{targets: [8,9], visible: false},
			{targets: [4,5,8,9], type: 'date'}
		],
		dom: 'BfRtip',
		pageLength: 20,
		buttons: [
			'colvis',
			'excel'
		],
		stateSave: true
	};

	/*
	*/
	constructor(
		public ngProgress: NgProgress, 
		public jira:JiraService, 
		private route:ActivatedRoute, 
		private user:UserService,
		public toastr: ToastrService,
		public webSock: WebSocketService
	) {}
	
	/*
	*/
	ngOnInit():void {

		this.route.paramMap.subscribe( params => {
			// default to my tickets
			this.ticketType = params.get('filter') || 'mytickets';
			// destroy any existing subscriptions
			this.destorySubscritions();
			// if required user info exists then get tickets and repos
			if( !this.user.requireCredentials() ){
				this.syncData();
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
	private destorySubscritions() {
		if(this.searchTicket$) this.searchTicket$.unsubscribe();
		if(this.webSock$) this.webSock$.unsubscribe();
	}

	/*
	*/
	syncData() {
		this.searchTicket$ = this.getTickets();

		// get list of repos once
		this.jira.getRepos().subscribe( 
			branches => this.repos = branches.data,
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

	/*
	*/
	startWebSocket() {

		// create websocket to receive ticket updates - skip first to get 'old' data
		return this.webSock.getTickets()
		.map(data => {

			switch(this.ticketType){
				case 'pcr':
					return data.pcrs;
				case 'qa':
					return data.qas;
				case 'mytickets':
					return data.all.filter(ticket => ticket.username === this.user.username);
				case 'allopen':
					return data.all;
				case 'cr':
					return data.all.filter(ticket => ['PCR - Completed', 'Code Review - Working'].includes(ticket.status) )
			}
		})
		.distinctUntilChanged( (old_tickets, new_tickets) => {
			return JSON.stringify(old_tickets) === JSON.stringify(new_tickets) 
		})
		.skip(1)
		.subscribe( data => {

			// save new tickets locally if my tickets
			if(!this.ticketType || this.ticketType == 'mytickets'){
				this.jira.setItem('mytickets', JSON.stringify(data));
			}

			this.openTickets = data;
			this.rerender();

		});
	}

	/*
	*/
	getTickets():Subscription {
		this.ngProgress.start();
		this.loadingTickets = true;

		return this.jira.getFilterData(this.ticketType)
		.subscribe(issues => {

				// save tickets and re-render data tables
				this.openTickets = issues.data;
				
				this.ngProgress.done();
				this.loadingTickets = false;

				// save new tickets locally if my tickets
				if(!this.ticketType || this.ticketType == 'mytickets'){
					this.jira.setItem('mytickets', JSON.stringify(this.openTickets));
				}
				
				// if cached data set we need to push rerender 
				// to end of event loop else force full rerender
				if(issues.cached){
					setTimeout(() => this.rerender(), 0)
				} else {
					this.rerender();
				}

				// enable websockets
				if( !this.ticketType || ['pcr','qa','cr','allopen','mytickets'].includes(this.ticketType) ) {
					this.webSock$ = this.startWebSocket();
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
