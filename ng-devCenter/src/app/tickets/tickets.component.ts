import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ActivatedRoute } from '@angular/router';

import { UserService } from './../services/user.service'
import { JiraService } from './../services/jira.service'
import { WorkTimePipe } from './../work-time.pipe'

import { DataTableDirective } from 'angular-datatables';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgProgress } from 'ngx-progressbar';

import * as $ from 'jquery';

@Component({
	selector: 'app-tickets',
	templateUrl: './tickets.component.html',
	styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

	openTickets:Array<any>;

	@ViewChild(DataTableDirective)
	private dtElement: DataTableDirective;
	dtTrigger:Subject<any> = new Subject();

	dtOptions = {
		order: [4, 'desc'],
		columnDefs: [{targets: [4,5], type: 'date'}],
		dom: 'Bfrtip',
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
		private jira:JiraService, 
		private route:ActivatedRoute, 
		private modalService:NgbModal, 
		private user:UserService
	) {}
	
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

			// if required user info exists then get tickets
			if(this.user.username && this.user.port && this.user.emberUrl){
				this.searchTicket$ = this.setFilterData( params.get('filter') );
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
	openModal(cru_id:string, key:string, modalType:string, content):void {

		// open modal then on close process result
		this.modalService.open(content).result.then( confirm => {

			// if confirm is true then do a PCR pass
			if(confirm){
				this.jira.pcrPass(cru_id, 'lm240n').subscribe( () => {

					// if we want PCR complete then	call PCR complete API 
					if(confirm === 'complete'){						
						this.jira.pcrComplete(key, 'lm240n').subscribe( () => {

							// get datatable instance and remove row
							this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
								dtInstance.row( $(`#${key}`)[0] ).remove();
							});
						});
					}
				});
			}
		});	
	}
}
