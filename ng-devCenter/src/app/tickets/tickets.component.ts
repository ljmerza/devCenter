import { Component, OnInit, ViewChild, EventEmitter, OnDestroy } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/subscription';

import { ActivatedRoute } from '@angular/router';

import { UserService } from './../services/user.service'
import { JiraService } from './../services/jira.service'
import { WorkTimePipe } from './../work-time.pipe'

import { DataTableDirective } from 'angular-datatables';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import * as $ from 'jquery';

@Component({
	selector: 'app-tickets',
	templateUrl: './tickets.component.html',
	styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit, OnDestroy {

	openTickets:Array<any>;
	isLoadingTickets:boolean = true;

	// getting filter info subscription
	getFilter$:Subscription;


	@ViewChild(DataTableDirective)
	private dtElement: DataTableDirective;
	dtTrigger:Subject<any> = new Subject();

	dtOptions = {
		order: [4, 'desc'],
		columnDefs: [{targets: [4,5], type: 'date'}],
		// Declare the use of the extension in the dom parameter
		dom: 'Bfrtip',
		// Configure the buttons
		buttons: [
			{
				extend: 'colvis',
				columns: ':gt(0)'
			}
		]
	};

	/*
	*/
	constructor(private jira:JiraService, private route:ActivatedRoute, private modalService:NgbModal, private user:UserService) {}
	
	/*
	*/
	ngOnInit():void {
		this.route.paramMap
		.subscribe( params => {
			if(this.user.username || this.user.port || this.user.emberUrl){
				this.setFilterData( params.get('filter') );
			}
		});
	}

	ngOnDestroy() {
		this.getFilter$.unsubscribe();
	}

	/*
	*/
	setFilterData(jiraListType:string):void {
		this.isLoadingTickets = true;

		this.getFilter$ = this.jira.getFilterData(jiraListType)
		.subscribe( issues => {
			if(issues.data) {
				// save tickets, set loading to false, and re-render data tables
				this.openTickets = issues.data;
				this.isLoadingTickets = false;
				this.rerender();
			}
		});
		
	}

	/*
	*/
	rerender():void {
		if(this.dtElement && this.dtElement.dtInstance){
			this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
				// Destroy the table first
				dtInstance.destroy();
				// Call the dtTrigger to re-render again
				this.dtTrigger.next();
			});
		} else {
			this.dtTrigger.next();
		}
	}

	/*
	*/
	openModal(cru_id:string, key:string, modalType:string, content):void {

		this.modalService.open(content).result.then( confirm => {

			// if confirm is true then change status
			if(confirm){

				// on success do events based on status change type
				const pcr$ = this.jira.pcrPass(cru_id, 'lm240n').subscribe( () => {

					pcr$.unsubscribe();

					// if PCR complete then	call PCR complete API and remove row from data table
					if(confirm === 'complete'){						

						// once call is done remove row from table
						const dtElement$ = this.jira.pcrComplete(key, 'lm240n').subscribe( () => {

							this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
								// Destroy the table first
								dtInstance.row( $(`#${key}`)[0] ).remove();
								// Destroy the table first
								dtInstance.destroy();
								// Call the dtTrigger to re-render again
								this.dtTrigger.next();

								dtElement$.unsubscribe();
							});
						});
					}
				});
			}
		});	
	}
}
