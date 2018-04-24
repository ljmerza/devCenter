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
export class TicketsComponent implements OnInit, AfterViewInit {
	loadingTickets:boolean = false;
	loadingIcon: boolean = false;
	ticketListType:string; // type of tickets to get
	repos: Array<Repo>;
	tickets = [];
	getTickets$;

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
			this.ticketListType = routeResponse.params.filter || 'mytickets';
			this.store.dispatch({type: Actions.ticketType, payload: this.ticketListType });
			this.getTickets();

			let tickets$ = this.store.select(this.ticketListType)
			.subscribe(tickets => {
				if(tickets$) tickets$.unsubscribe();
				this.processTickets(tickets);
			});
		});
	}

	ngAfterViewInit(): void {
    	this.dtTrigger.next();
	}

	/**
	 * Start loading animations and get tickets. Once store triggers tickets event,
	 * stop loading animations and re-render the data-table. If error then Toast error message.
	 * @param {Boolean} isHardRefresh if hard refresh skip localStorage retrieval and loading animations
	 */
	public getTickets() {

		if(this.getTickets$) this.getTickets$.unsubscribe();
		if(this.ngProgress) this.ngProgress.done();
		this.ngProgress.start();
		this.loadingIcon = true;

		this.getTickets$ = this.jira.getTickets(this.ticketListType, true)
		.subscribe((response:APIResponse) => {
			this.ngProgress.done();
			this.loadingIcon = false;
			this.store.dispatch({type: Actions.newTickets, payload: response.data});
		},
			this.jira.processErrorResponse.bind(this.jira)
		);
	}

	/**
	 * stops the loading of tickets
	 */
	stopGetTickets(){
		if(this.getTickets$) this.getTickets$.unsubscribe();
		this.loadingIcon = false;
		this.loadingTickets = false;
		this.ngProgress.done();
		this._renderTable();
	}

	/**
	 * If a list of tickets exist then process the end of ticket retrieval
	 * @param {Array<Tickets>} tickets
	 */
	private processTickets(tickets) {
		if(tickets.length === 0) {
			this.loadingTickets = true;
			return;
		}

		this.loadingTickets = false;
		if(JSON.parse(JSON.stringify(this.tickets)) !== JSON.parse(JSON.stringify(tickets))){
			this.tickets = tickets;
			this._renderTable();
		}
	}

	/**
	 * renders the data table
	 */
	_renderTable(){
		this.dtElement.dtInstance.then((dtInstance:DataTables.Api) => {
			dtInstance.destroy();
			this.dtTrigger.next();
		});
	}
}