import { Component, OnInit, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Subject } from 'rxjs/Rx';
import { ActivatedRoute } from '@angular/router';

import { JiraService } from './../services/jira.service'
import { EstimatePipe } from './../estimate.pipe'

import { DataTableDirective } from 'angular-datatables';
import { MaterializeDirective, MaterializeAction } from "angular2-materialize";

import * as $ from 'jquery';

@Component({
	selector: 'app-open-tickets',
	templateUrl: './open-tickets.component.html',
	styleUrls: ['./open-tickets.component.css']
})
export class OpenTicketsComponent implements OnInit, AfterViewInit {

	constructor(private jira: JiraService, private route:ActivatedRoute) { }

	@ViewChild(DataTableDirective)
	private dtElement: DataTableDirective;
	dtTrigger:Subject<any> = new Subject();
	dtOptions: DataTables.Settings = {
		order:[4, 'asc']
	};
	
	openTickets:Array<any>;
	jiraListType:string;
	isLoading:boolean = true;

	jiraUrl = this.jira.jiraUrl;

	pcrType;
	crucibleId;
	pcrModelAction = new EventEmitter<string|MaterializeAction>();

	/*
	*/
	ngOnInit() {

		this.route.paramMap
		.subscribe( params => {

			this.isLoading = true;
			this.jiraListType = params.get('filter');

			let filterNumber:number;

			switch(this.jiraListType) {

				case 'pcr':
					filterNumber = 11128;
					break;

				case 'beta':
					filterNumber = 11004;
					break;

				case 'cr':
					filterNumber = 11007;
					break;

				case 'qa':
					filterNumber = 11019;
					break;

				case 'uctready':
					filterNumber = 11014;
					break;

				case 'allmy':
					filterNumber = 11418;
					break;

				case 'allopen':
					filterNumber = 12523;
					break;

				default:
					filterNumber = 12513;
					break;
			}

			this.setFilterData(filterNumber);
		});
	}

	/*
	*/
	ngAfterViewInit(): void {
		this.dtTrigger.next();
	}

	/*
	*/
	setFilterData(filterNumber): void {

		this.jira.getFilter(filterNumber)
		.subscribe( issues => {
			if(issues.data) {
				// save tickets, set loading to false, and rerender datatables
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
	openPcrModal(crucibleId, pcrType) {
		this.pcrType = pcrType;
		this.crucibleId = crucibleId;
		this.pcrModelAction.emit({action:"modal",params:['open']});
	}

	/*
	*/
	closePcrModal() {
		this.pcrModelAction.emit({action:"modal",params:['close']});
	}

	/*
	*/
	confirmPcrModal() {
		this.closePcrModal();
		let obs;

		if( this.pcrType.match(/^pass$/i) ){
			obs = this.jira.pcrPass(this.crucibleId, 'lm240n')
		} else {
			obs = this.jira.pcrComplete(this.crucibleId, 'lm240n');
		}

		obs.subscribe( response => {
			console.log('response',response);
		});
	}
}
