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
					setTimeout(() => this.rerender(true),0);
				} else {
					this.rerender(true);
				}

				// if pcr or qa then enable websockets
				if( ['pcr','qa','cr','allopen','my'].includes(this.ticketType) ) {
					this.webSock$ = this.startWebSocket();
				}
			},
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

	/*
	*/
	rerender(forceDestory:boolean=false):void {

		if(this.dtElement && this.dtElement.dtInstance){
			this.dtElement.dtInstance.then( (dtInstance:DataTables.Api) => {
				// do we want to force reset datatables or just redraw it?
				if(forceDestory) {
					dtInstance.destroy();
					this.dtTrigger.next();
				} else {
					setTimeout(dtInstance.draw,0);
				}
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
