import { Component, OnInit, ViewChild, Input, EventEmitter, OnDestroy } from '@angular/core';
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

	@Input() reloadTicketsEvent = new EventEmitter();
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
		this.route.paramMap
		.subscribe( params => {
			this.ticketType = params.get('filter');

			// if an ajax request is already being made then cancel it
			if(this.searchTicket$) this.searchTicket$.unsubscribe();
			// if web socket is already being made then cancel it
			if(this.webSock$) this.webSock$.unsubscribe();

			// if required user info exists then get tickets and repos
			if( !this.user.requireCredentials() ){
				this.syncData();
			}
		});
	}

	/*
	*/
	ngOnDestroy(){
		if(this.searchTicket$) this.searchTicket$.unsubscribe();
		if(this.webSock$) this.webSock$.unsubscribe();
	}

	/*
	*/
	syncData() {
		this.searchTicket$ = this.setFilterData(this.ticketType);

		// get list of repos once
		this.jira.getRepos().subscribe( 
			branches => this.repos = branches.data,
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);

		// if pcr or qa then enable websockets
		if( ['pcr','qa'].includes(this.ticketType) ) {
			this.webSock$ = this.startWebSocket();
		}
	}

	/*
	*/
	startWebSocket() {
		// create websocket to receive ticket updates - skip first to get 'old' data
		return this.webSock.getTickets()
		.map(data => this.ticketType == 'pcr' ? data.pcrs : data.qas)
		.distinctUntilChanged( (old_tickets, new_tickets) => {
			return JSON.stringify(old_tickets) === JSON.stringify(new_tickets) 
		})
		.skip(1)
		.subscribe( data => {
			// if got this far then data is different so sync with UI
			this.openTickets = data;
			this.rerender();
		});
	}

	/*
	*/
	setFilterData(jiraListType:string):Subscription {
		this.ngProgress.start();
		this.loadingTickets = true;

		return this.jira.getFilterData(jiraListType)
		.subscribe(
			issues => {
				// save tickets and re-render data tables
				this.openTickets = issues.data;
				this.rerender();
				this.ngProgress.done();
				this.loadingTickets = false;
			},
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

	/*
	*/
	rerender():void {

		// if datatable already exists then destroy then render else just render
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
				dtInstance.draw();
			});

		}
	}
}
