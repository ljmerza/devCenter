import { Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { NgProgress } from 'ngx-progressbar';

import { Subject, Observable } from 'rxjs';
import 'rxjs/add/observable/interval';
import { select, NgRedux } from '@angular-redux/store';

import { UserService, JiraService, ToastrService, WebSocketService, GitService } from '@services';
import { RootState, Actions } from '@store';
import { Repo, Ticket, APIResponse } from '@models';

@Component({
	selector: 'dc-tickets',
	templateUrl: './tickets.component.html',
	styleUrls: ['./tickets.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class TicketsComponent implements OnInit, OnDestroy, AfterViewInit {
	loadingTickets:boolean = false;
	loadingFromApi = false;
	ticketListType:string; // type of tickets to get
	repos: Array<Repo>;
	tickets = [];
	tickets$;

	dtTrigger:Subject<any> = new Subject();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@select('repos') getRepos$: Observable<Array<Repo>>;

	get tableTitle(){
		return `${this.jira.title} Tickets`;
	}

	dtOptions = {
		order: [[4, 'desc']],
		columnDefs: [
			{targets: [9,10], visible: false},
			{targets: 4, width: '10%'},
			{targets: [5,6,9,10], type: 'date'}
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

	constructor(
		public ngProgress: NgProgress, public route:ActivatedRoute, private store:NgRedux<RootState>,
		public jira:JiraService, public user:UserService, private git:GitService
	) {}
	
	/**
	 * On initialization of component, if user credentials exist get repository list.
	 * on route parameter event trigger, get URL parameter and get list
	 * of tickets based on URL parameter if user has credentials
	 */
	ngOnInit():void {
		if(this.user.needRequiredCredentials()) return;

		this.git.getRepos().subscribe(
			repos => this.store.dispatch({type: Actions.repos, payload: repos.data }),
			this.git.processErrorResponse.bind(this.git)
		);
		
		this.route.paramMap.subscribe((routeResponse:any) => {
			this.tickets = [];
			this.ticketListType = routeResponse.params.filter;
			this.getTickets();

			this.tickets$ = this.store.select(this.ticketListType)
			.subscribe(this.processTickets.bind(this));
		});
	}

	/**
	 *
	 */
	ngOnDestroy(){
		if(this.tickets$) this.tickets$.unsubscribe();
	}

	/**
	 * Start loading animations and get tickets. Once store triggers tickets event,
	 * stop loading animations and re-render the data-table. If error then Toast error message.
	 * @param {Boolean} isHardRefresh if hard refresh skip localStorage retrieval and loading animations
	 */
	public getTickets() {
		this.ngProgress.start();

		this.jira.getTickets(this.ticketListType, true)
		.subscribe((response:APIResponse) => {
			this.loadingFromApi = true;
			this.ngProgress.done();
			response.data.listType = this.ticketListType;
			this.store.dispatch({type: Actions.newTickets, payload: response.data})
		},
			this.jira.processErrorResponse.bind(this.jira)
		);
	}

	ngAfterViewInit(): void {
    	this.dtTrigger.next();
	}

	/**
	 * If a list of tickets exist then process the end of ticket retrieval
	 * @param {Array<Tickets>} tickets
	 */
	private processTickets(tickets) {

		if(!tickets.length) {
			this.loadingTickets = true;
			return;
		}

		this.loadingTickets = false;
		console.log('tickets: ', tickets);
		this.tickets = tickets;
		this.rerender();
	}

	/**
	 * if we are loading from the API load the data table immediately else 
	 * we are loading from the store which is too fast for data tables so set
	 * to the back of the event loop with setTimeout
	 */
	private rerender():void {
		if(this.loadingFromApi){
			this.loadingFromApi = false;
			this.renderDataTable();
			// setTimeout(this.renderDataTable.bind(this), 1000);
		} else {
			// this.renderDataTable();
			setTimeout(this.renderDataTable.bind(this));
		}
	}

	/**
	 * render the data-table. If instance of data-table already exists then
	 * destroy it first then render it
	 */
	renderDataTable(){
		this.dtElement.dtInstance.then((dtInstance:DataTables.Api) => {
			let t = dtInstance.destroy();
			console.log('t: ', t);
			let s = this.dtTrigger.next();
			console.log('s: ', s);
		});
	}
}