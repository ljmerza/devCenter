import { Component, OnInit, ViewChild, Input, EventEmitter, ViewContainerRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject, Observable, Subscription } from 'rxjs';
import 'rxjs/add/observable/interval';

import { UserService } from './../services/user.service';
import { JiraService } from './../services/jira.service';
import { ToastrService } from './../services/toastr.service';

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
	userReloadTickets$
	repos;
	dtTrigger:Subject<any> = new Subject();

	@Input() reloadTicketsEvent = new EventEmitter();
	@ViewChild(DataTableDirective) private dtElement: DataTableDirective;

	dtOptions = {
		order: [4, 'desc'],
		columnDefs: [{targets: [4,5,8,9], type: 'date'}],
		dom: 'Bfrtip',
		pageLength: 20,
		buttons: [
			{
				extend: 'colvis',
				columns: ':gt(0)'
			}
		],
		colReorder: true,
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
		vcr: ViewContainerRef
	) {
		this.toastr.toastr.setRootViewContainerRef(vcr);
	}
	
	/*
	*/
	ngOnInit():void {
		this.route.paramMap
		.subscribe( params => {
			const ticket_type = params.get('filter');

			// if an ajax request is already being made then cancel it
			if (this.searchTicket$) {
	   			this.searchTicket$.unsubscribe();
			}

			// if an interval is already defined then stop it
			if (this.userReloadTickets$) {
	   			this.userReloadTickets$.unsubscribe();
			}

			// if required user info exists then get tickets and repos
			if( !this.user.requireCredentials() ){
				this.searchTicket$ = this.setFilterData(ticket_type);

				// get list of repos once
				this.jira.getRepos().subscribe( 
					branches => this.repos = branches.data,
					error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
				);
			}
		});
	}

	/*
	*/
	ngOnDestroy(){
		this.searchTicket$.unsubscribe();
	}

	/*
	*/
	setFilterData(jiraListType:string):Subscription {
		this.ngProgress.start();
		this.loadingTickets = true;

		// every x milliseconds get latest tickets if last ajax call finished
		// only update if different then last ajax -> start first time immediately
		return Observable.interval(10000)
		.startWith(0)
		.exhaustMap(() => this.jira.getFilterData(jiraListType))
		.distinctUntilChanged( (old_tickets, new_tickets) => {

			if(!old_tickets){
				return false;
			}

			console.log('old_tickets, new_tickets: ', old_tickets, new_tickets);

			const old_ticket_keys = old_tickets.data.map( ticket => ticket.key);
			const new_ticket_keys = new_tickets.data.map( ticket => ticket.key);

			var difference = old_ticket_keys.filter( x => !(new Set(new_ticket_keys.has(x))) );

			console.log(old_tickets.data, new_tickets.data, difference)
			return JSON.stringify(old_tickets.data) === JSON.stringify(new_tickets.data)
		})
		.subscribe( 
			issues => {
				// save tickets and re-render data tables
				this.openTickets = this._formatCommentCode(issues);
				this.rerender();
				this.ngProgress.done();
				this.loadingTickets = false;
			},
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

	/*
	*/
	_formatCommentCode(issues){
		return issues.data.map( issue => {
			issue.comments = issue.comments.map( comment => {
				const splitComment = comment.comment.split('{code}');

				if(splitComment.length > 1){
					for(let i=0;i<splitComment.length-1;i++){
						if(i%2==1){
							splitComment[i] = splitComment[i].replace('<br>', '');
							splitComment[i] = `<pre class='code'>${splitComment[i]}</pre>`;
						}
					}
				}

				comment.comment = splitComment.join('');
				return comment;
			});

			return issue;
		});
	}

	/*
	*/
	rerender():void {

		// if datatable already exists then destroy then render else just render
		if(this.dtElement && this.dtElement.dtInstance){
			this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
				dtInstance.destroy();
				this.dtTrigger.next();
				// make redraw on next event loop
				// setTimeout(dtInstance.draw,0);
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

		} else {
			
		}
		
	}
}
