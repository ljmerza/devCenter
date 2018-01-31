import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select } from '@angular-redux/store';

import { Subject, Observable, Subscription } from 'rxjs';
import 'rxjs/add/observable/interval';

import { UserService } from './../../shared/services/user.service';
import { JiraService } from './../../shared/services/jira.service';
import { ToastrService } from './../../shared/services/toastr.service';
import { WebSocketService } from './../../shared/services/web-socket.service';
import { LocalStorageService } from './../../shared/services/local-storage.service';

import { DataTableDirective } from 'angular-datatables';
import { NgProgress } from 'ngx-progressbar';

import { Ticket } from './../../shared/store/models/ticket';

@Component({
	selector: 'dc-tickets',
	templateUrl: './tickets.component.html',
	styleUrls: ['./tickets.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class TicketsComponent implements OnInit {
	loadingTickets:boolean = true;
	ticketType:string;
	repos;
	dtTrigger:Subject<any> = new Subject();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@select('tickets') openTickets$:Observable<Array<Ticket>>;

	dtOptions = {
		order: [[4, 'desc']],
		columnDefs: [
			{targets: [8,9], visible: false},
			{targets: 3, width: '10%'},
			{targets: [4,5,8,9], type: 'date'}
		],
		dom: `
			<'row'<'col-sm-12'Bfl>>
			<'row'<'col-sm-12'tr>>
			<'row'<'col-sm-12'ip>>
		`,
		pageLength: 5,
		lengthMenu: [5, 10, 15, 20, 100],
		buttons: ['colvis', 'excel'],
		stateSave: true,
		pagingType: 'full',
		language: {
			search: "",
        	searchPlaceholder: "Search Ticket",
        	zeroRecords: 'No matching tickets found'
        }
	};

	constructor(public lStore:LocalStorageService, public ngProgress: NgProgress, public route:ActivatedRoute, 
		public jira:JiraService, public user:UserService, public toastr: ToastrService, public webSock: WebSocketService
	) {}
	
	/**
	 * On initialization of component, if user credentials exist get repository list.
	 * on route parameter event trigger, get URL parameter and get list
	 * of tickets based on URL parameter if user has credentials
	 */
	ngOnInit():void {
		if( !this.user.needRequiredCredentials() ){
			this.jira.getRepos().subscribe( 
				branches => this.repos = branches.data,
				error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
			);
		}

		this.route.paramMap.subscribe(params => {
			this.ticketType = params.get('filter') || 'mytickets';
			if( !this.user.needRequiredCredentials() ) this.getTickets();
		});
	}

	/**
	 * Start loading animations and get tickets. Once store triggers tickets event,
	 * stop loading animations and re-render the data-table. If error then Toast error message.
	 * @param {Boolean} isHardRefresh if hard refresh skip localStorage retrieval and loading animations
	 */
	getTickets(isHardRefresh:Boolean=false) {
		if(isHardRefresh) this.loadingTickets = false;

		this.ngProgress.start();
		this.jira.getTickets(this.ticketType, isHardRefresh);

		this.openTickets$.subscribe(
			tickets => {
				console.log('tickets: ', tickets);
				if(tickets && tickets.length > 0){
					this.ngProgress.done();
					this.loadingTickets = false;
					this.rerender();
				}	
			},
			error => this.toastr.showToast(this.jira.processErrorResponse(error), 'error')
		);
	}

	/**
	 * render the data-table. If instance of data-table already exists then
	 * destroy it first then render it
	 */
	rerender():void {

		if(this.dtElement && this.dtElement.dtInstance){
			this.dtElement.dtInstance.then( (dtInstance:DataTables.Api) => {
				dtInstance.destroy();
				this.dtTrigger.next();			
			});
		} else {
			this.dtTrigger.next();
		}
	}
}