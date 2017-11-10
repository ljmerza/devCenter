import { Component, OnInit, ViewChild, Input, EventEmitter, ViewContainerRef } from '@angular/core';

import { Subject } from 'rxjs/Subject';

import { ActivatedRoute } from '@angular/router';

import { UserService } from './../services/user.service';
import { JiraService } from './../services/jira.service';
import { WorkTimePipe } from './../work-time.pipe';

import { DataTableDirective } from 'angular-datatables';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgProgress } from 'ngx-progressbar';
import { ToastrService } from './../services/toastr.service';

import { QaGeneratorComponent } from './../qa-generator/qa-generator.component';

import * as $ from 'jquery';

@Component({
	selector: 'app-tickets',
	templateUrl: './tickets.component.html',
	styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

	@Input() reloadTicketsEvent = new EventEmitter();

	openTickets:Array<any>;
	ticket_list_type:string;

	@ViewChild(DataTableDirective) private dtElement: DataTableDirective;
	dtTrigger:Subject<any> = new Subject();

	@ViewChild(QaGeneratorComponent) private qaGen:QaGeneratorComponent;

	dtOptions = {
		order: [4, 'desc'],
		columnDefs: [{targets: [4,5], type: 'date'}],
		dom: 'Bfrtip',
		pageLength: 20,
		buttons: [
			{
				extend: 'colvis',
				columns: ':gt(0)'
			}
		]
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
	searchTicket$;
	ngOnInit():void {
		this.route.paramMap
		.subscribe( params => {

			// if an ajax request is already being made then cancel it
			if (this.searchTicket$) {
	   			this.searchTicket$.unsubscribe();
			}

			this.ticket_list_type = params.get('filter');

			// if required user info exists then get tickets
			if(this.user.username && this.user.port && this.user.emberUrl){
				this.searchTicket$ = this.setFilterData( this.ticket_list_type );
			}
		});
	}

	/*
	*/
	setFilterData(jiraListType:string) {
		this.ngProgress.start();

		return this.jira.getFilterData(jiraListType)
		.subscribe( issues => {
			// save tickets and re-render data tables
			this.openTickets = issues.data;
			this.ngProgress.done();
			this.rerender();
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
				this.jira.pcrPass(cru_id, 'lm240n').subscribe( () => {
					this.toastr.showToast('PCR Passed.', 'success');

					// if we want PCR complete then	call PCR complete API 
					if(confirm === 'complete'){						
						this.jira.pcrComplete(key, 'lm240n').subscribe( () => {

							this.toastr.showToast('PCR Completed.', 'success');

							// get datatable instance, remove row, redraw table
							this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
								dtInstance.row( $(`#${key}`)[0] ).remove();
								dtInstance.draw();
							});
						});
					}
				});
			}
		});	
	}

	/*
	*/
	openQAModal(msrp){
		this.qaGen.openQAModal(msrp);
	}
}
