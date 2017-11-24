import { Component, OnInit, ViewChild, Input, EventEmitter, ViewContainerRef, OnDestroy } from '@angular/core';

import { Subject, Observable, Subscription } from 'rxjs';

import { ActivatedRoute } from '@angular/router';

import { UserService } from './../services/user.service';
import { JiraService } from './../services/jira.service';
import { WorkTimePipe } from './../work-time.pipe';

import { DataTableDirective } from 'angular-datatables';
import { NgProgress } from 'ngx-progressbar';
import { ToastrService } from './../services/toastr.service';

import config from '../services/config';

import 'rxjs/add/observable/interval';

import { QaGeneratorComponent } from './../qa-generator/qa-generator.component';
import { JiraCommentsComponent } from './../jira-comments/jira-comments.component';
import { PcrModalComponent } from './../pcr-modal/pcr-modal.component';
import { TimeLogComponent } from './../time-log/time-log.component';

import * as $ from 'jquery';

@Component({
	selector: 'app-tickets',
	templateUrl: './tickets.component.html',
	styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit, OnDestroy {
	config=config
	loadingTickets:boolean = true;
	openTickets:Array<any>;

	searchTicket$;
	userReloadTickets$
	dtTrigger:Subject<any> = new Subject();

	@Input() reloadTicketsEvent = new EventEmitter();

	@ViewChild(DataTableDirective) private dtElement: DataTableDirective;
	@ViewChild(QaGeneratorComponent) private qaGen: QaGeneratorComponent;
	@ViewChild(JiraCommentsComponent) private jiraComments: JiraCommentsComponent;
	@ViewChild(PcrModalComponent) private pcrModal: PcrModalComponent;
	@ViewChild(TimeLogComponent) private logWork: TimeLogComponent;

	ticketStates = [
		'Triage',
		'Backlog',
		'In Sprint',
		'In Development',
		'PCR - Needed',
		'PCR - Pass',
		'PCR - Completed',
		'Code Review - Working',
		'Ready for QA',
		'In QA',
		'QA Fail',
		'Merge Code',
		'Ready for UCT',
		'In UCT',
		'Ready for Release',
		'Closed',
		'On Hold'
	];


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

			// if required user info exists then get tickets
			if(this.user.username && this.user.port && this.user.emberUrl){
				this.searchTicket$ = this.setFilterData(ticket_type);
			}

			// only interval refresh tickets on certain routes
			if( ['qa', 'pcr', 'allopen'].includes(ticket_type) ){
				// be notified if user changes settings
				this.userReloadTickets$ = this.user.notifyTickets$.subscribe( () => {
					this.setFilterData(ticket_type);
		      	});	
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
	openLogModal(key:string):void {
		this.logWork.openLogModal(key);
	}

	/*
	*/
	openCommentModal(msrp:string, comments):void {
		this.jiraComments.openCommentModal(msrp, comments);
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
			// else revert status change
			this.ticketDropdown.value = this.oldState;
			if(showToast) {
				this.toastr.showToast(`Ticket status change cancelled for ${key}`, 'info');
			}
		}
		
	}

	/*
	*/
	logTimeEvent({key, logTime}):void {
		const ticket = this.openTickets.filter( ticket => ticket.key == key);
		
		if(ticket.length == 1){
			ticket[0].dates.logged += logTime;
			this.rerender();
		} else {
			this.toastr.showToast(`Could not update time log for ${key} on frontend interface`, 'info');
		}
	}

	/*
	*/
	newCrucible({key, crucible_id=''}):void {

		const ticket = this.openTickets.filter( ticket => ticket.key == key);

		if(ticket.length == 1){

			if(crucible_id) {
				ticket[0].crucible_id = crucible_id;
				this.rerender();
			} else {
				this.ticketDropdown.value = this.oldState;
				this.toastr.showToast(`Ticket status change cancelled for ${key}`, 'info');
			}

		} else {
			this.toastr.showToast(`Error updating tikcet status on UI for ${key}`, 'info');
		}

		
	}

	oldState;
	ticketDropdown;
	stateChange(ticketDropdown, ticket){
		// save select element reference and old status
		this.ticketDropdown = ticketDropdown;
		this.oldState = ticket.component || ticket.status;

		// open QA gen
		if(ticketDropdown.value == 'PCR - Needed'){
			this.qaGen.openQAModal(ticket.msrp, ticket.key);

		} else if(ticketDropdown.value == 'PCR - Pass'){
			ticketDropdown.value = 'PCR - Needed';
			this.pcrModal.openPCRModal(ticket.crucible_id, ticket.key, 'pass');

		}  else if(ticketDropdown.value == 'PCR - Completed'){
			this.pcrModal.openPCRModal(ticket.crucible_id, ticket.key, 'complete');
		}
	}
}
