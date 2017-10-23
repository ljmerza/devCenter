import { Component, OnInit, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Subject } from 'rxjs/Rx';
import { ActivatedRoute } from '@angular/router';

import { JiraService } from './../services/jira.service'
import { WorkTimePipe } from './../work-time.pipe'

import { DataTableDirective } from 'angular-datatables';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import * as $ from 'jquery';

@Component({
	selector: 'app-open-tickets',
	templateUrl: './open-tickets.component.html',
	styleUrls: ['./open-tickets.component.css']
})
export class OpenTicketsComponent implements OnInit, AfterViewInit {

	constructor(private jira: JiraService, private route:ActivatedRoute, private modalService: NgbModal) { }

	@ViewChild(DataTableDirective)
	private dtElement: DataTableDirective;
	dtTrigger:Subject<any> = new Subject();
	dtOptions: DataTables.Settings = {
		order: [4, 'desc'],
		columnDefs: [{targets: [4,5], type: 'date'}]
	};
	
	openTickets:Array<any>;
	jiraListType:string;
	isLoading:boolean = true;

	jiraUrl = this.jira.jiraUrl;
	crucibleUrl = this.jira.crucibleUrl;

	// status modal message var
	statusModelMessage;

	/*
	*/
	ngOnInit() {

		this.route.paramMap
		.subscribe( params => {

			this.isLoading = true;
			this.jiraListType = params.get('filter');

			this.setFilterData(this.jiraListType);
		});
	}

	/*
	*/
	ngAfterViewInit(): void {
		this.dtTrigger.next();
	}

	/*
	*/
	setFilterData(jiraListType): void {

		this.jira.getFilterData(jiraListType)
		.subscribe( issues => {
			if(issues.data) {
				// save tickets, set loading to false, and rerender data tables
				this.openTickets = issues.data;
				this.isLoading = false;
				this.rerender();
			}
		});
	}

	/*
	*/
	rerender(): void {

		if(this.dtElement && this.dtElement.dtInstance){
			this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
				// Destroy the table first
				dtInstance.destroy();
				// Call the dtTrigger to rerender again
				this.dtTrigger.next();

			});
		} else {
			this.dtTrigger.next();
		}
	}

	/*
	*/
	openModal(id, modalType, content) {

		// change messages on modal based on status change type
		if(modalType === 'complete'){
			this.statusModelMessage = 'PCR Complete';
		} else if(modalType === 'pass'){
			this.statusModelMessage = 'PCR Pass';
		}


		this.modalService.open(content).result.then( confirm => {

			// if confirm is true then change status
			if(confirm){
				let obs;

				// create observable based on status change type
				if(modalType === 'pass'){
					obs = this.jira.pcrPass(id, 'lm240n')
				} else if(modalType === 'complete'){
					obs = this.jira.pcrComplete(id, 'lm240n');
				}

				// on success do events based on status change type
				obs.subscribe( response => {

					// if PCR complete then remove row from data table
					if(modalType === 'complete'){
						this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
							// Destroy the table first
							dtInstance.row( $(`#${id}`)[0] ).remove();
							// Destroy the table first
							dtInstance.destroy();
							// Call the dtTrigger to rerender again
							this.dtTrigger.next();
						});
					}

				});
			}
		});
	}
}
