import { Component, OnInit, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Subject } from 'rxjs/Rx';
import { ActivatedRoute } from '@angular/router';

import { UserService } from './../services/user.service'
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

	username:string;
	port:string;
	emberUrl:string;

	userSettingsNeeded:boolean = false;
	modalOpen:boolean = false;

	constructor(
		private jira:JiraService, 
		private route:ActivatedRoute, 
		private modalService:NgbModal, 
		private user:UserService
	) {

		this.username = user.username;
		this.port = user.port;
		this.emberUrl = user.emberUrl;

		if(!this.username || !this.port || !this.emberUrl){
			this.userSettingsNeeded = true;
		}
	}

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
			'columnsToggle',
			'colvis',
			'copy',
			'print',
			'excel',
			{
				text: 'Some button',
				key: '1',
				action: function (e, dt, node, config) {
				alert('Button activated');
			}
		}]
	};
	
	openTickets:Array<any>;
	isLoading:boolean = false;
	jiraListType:string;

	jiraUrl = this.jira.jiraUrl;
	crucibleUrl = this.jira.crucibleUrl;

	intervalId;

	// status modal message var
	statusModelMessage;

	/*
	*/
	ngOnInit() {

		this.route.paramMap
		.subscribe( params => {
			this.jiraListType = params.get('filter');

			// start
			this.intervalId = setInterval( () =>{
				if(!this.isLoading && !this.modalOpen){
					this.setFilterData();
					clearInterval(this.intervalId);
				}
			}, 2000);
		});
	}

	/*
	*/
	ngAfterViewInit(): void {
		this.dtTrigger.next();
	}

	/*
	*/
	setFilterData(): void {

		if(!this.userSettingsNeeded){
			this.isLoading = true;

			this.jira.getFilterData(this.jiraListType)
			.subscribe( issues => {
				if(issues.data) {
					// save tickets, set loading to false, and re-render data tables
					this.openTickets = issues.data;
					this.isLoading = false;
					this.rerender();
				}
			});
		}
		
	}

	/*
	*/
	rerender(): void {
		console.log('render');

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
	modalType;
	statusModelTitle;
	openModal(cru_id, key, modalType, content) {

		this.modalType = modalType;
		this.modalOpen = true;

		// change messages on modal based on status change type
		if(modalType === 'pass'){
			this.statusModelMessage = 'Would you like to PCR Pass or Complete?';
			this.statusModelTitle = 'PCR Pass/Complete';
		}


		this.modalService.open(content).result.then( confirm => {

			this.modalOpen = false;

			// if confirm is true then change status
			if(confirm){
				let obs;

				// create observable based on status change type
				if(confirm === 'pass' || confirm === 'complete'){
					obs = this.jira.pcrPass(cru_id, 'lm240n');
				}

				// on success do events based on status change type
				obs.subscribe( () => {

					// if PCR complete then	call PCR complete API and remove row from data table
					if(confirm === 'complete'){
						obs = this.jira.pcrComplete(key, 'lm240n');

						// once call is done remove row from table
						obs.subscribe( () => {
							this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
								// Destroy the table first
								dtInstance.row( $(`#${key}`)[0] ).remove();
								// Destroy the table first
								dtInstance.destroy();
								// Call the dtTrigger to re-render again
								this.dtTrigger.next();
							});
						});
					}
				});
			}
		});	
	}
}
