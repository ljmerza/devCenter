import { Component, OnInit, ViewChild, Input, EventEmitter, ViewContainerRef, OnDestroy } from '@angular/core';

import { Subject, Observable } from 'rxjs';

import { ActivatedRoute } from '@angular/router';

import { UserService } from './../services/user.service';
import { JiraService } from './../services/jira.service';
import { WorkTimePipe } from './../work-time.pipe';

import { DataTableDirective } from 'angular-datatables';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgProgress } from 'ngx-progressbar';
import { ToastrService } from './../services/toastr.service';

import config from '../services/config';

import 'rxjs/add/observable/interval';

import { QaGeneratorComponent } from './../qa-generator/qa-generator.component';
import { JiraCommentsComponent } from './../jira-comments/jira-comments.component';

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
	@ViewChild(QaGeneratorComponent) private qaGen:QaGeneratorComponent;
	@ViewChild(JiraCommentsComponent) private jiraComments:JiraCommentsComponent;


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
		private modalService:NgbModal, 
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
	setFilterData(jiraListType:string) {
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
	openPCRModal(cru_id:string, key:string, modalType:string, content):void {

		// open modal then on close process result
		this.modalService.open(content).result.then( confirm => {


			// if confirm is true then do a PCR pass
			if(confirm){
				this.jira.pcrPass(cru_id, this.user.username).subscribe( 
					() => {
						this.toastr.showToast('PCR Passed.', 'success');

						// if we want PCR complete then	call PCR complete API 
						if(confirm === 'complete'){						
							this.jira.pcrComplete(key, this.user.username).subscribe( 
								() => {

									this.toastr.showToast('PCR Completed.', 'success');

									// get datatable instance, remove row, redraw table
									this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
										dtInstance.row( $(`#${key}`)[0] ).remove();
										dtInstance.draw();
									});
								},
								error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
							);
						}
					}, 
					error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
				);
			}
		});	
	}

	/*
	*/
	openQAModal(msrp:string, key:string){
		this.qaGen.openQAModal(msrp, key);
	}

	openCommentModal(msrp:string, comments){
		this.jiraComments.openCommentModal(msrp, comments);
	}

	newCrucible(data){
		console.log(data)
	}
}
