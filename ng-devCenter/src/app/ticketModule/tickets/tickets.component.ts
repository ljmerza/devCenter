import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgProgress } from 'ngx-progressbar';

import { Observable } from 'rxjs';
import 'rxjs/add/observable/interval';
import { select, NgRedux } from '@angular-redux/store';

import { UserService, JiraService, GitService } from '@services';
import { RootState, Actions } from '@store';
import { Repo, APIResponse } from '@models';

declare let $;

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
	renderTimeoutId;
	ticketsRedux$;

	@select('repos') getRepos$: Observable<Array<Repo>>;

	@ViewChild('table') table:ElementRef
	@ViewChild('tbody') tbody:ElementRef
	@ViewChild('filterInput') filterInput:ElementRef

	get tableTitle(){
		return `${this.jira.title} Tickets`;
	}

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
			repos => this.store.dispatch({type: Actions.repos, payload: repos.data}),
			this.git.processErrorResponse.bind(this.git)
		);
		
		this.route.paramMap.subscribe((routeResponse:any) => {
			this.ticketListType = routeResponse.params.filter || 'mytickets';
			this.store.dispatch({type: Actions.ticketType, payload: this.ticketListType });

			this.filterTable();
			this.getTickets();
				
			if(this.ticketsRedux$) this.ticketsRedux$.unsubscribe();
			this.ticketsRedux$ = this.store.select(this.ticketListType)
			.subscribe(tickets => this.processTickets(tickets || []));
		});
	}

	/**
	 * create data table on init of UI
	 */
	ngAfterViewInit(): void {
		
	}

	/**
	 *	destroy any subscribers
	 */
	ngOnDestroy(){
		if(this.ticketsRedux$) this.ticketsRedux$.unsubscribe();
		if(this.getTickets$) this.getTickets$.unsubscribe();
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
	}

	/**
	 * If a list of tickets exist then process the end of ticket retrieval
	 * @param {Array<Ticket>} tickets
	 */
	private processTickets(tickets) {
		if(tickets.length === 0) {
			this.loadingTickets = true;
			return;
		}

		this.loadingTickets = false;
		this.tickets = tickets;

		this.filterTable();
		this.addSortTable();
	}

	/**
	 * 
	 */
	addSortTable(){
		$(this.table.nativeElement).trigger('destroy');

		setTimeout(() => {
			$(this.table.nativeElement).tablesorter({
				sortList: [[5,1]] 
			});
		});
	}

	/**
	 *  hacky way to add table filtering
	 */
	public filterTable(){
		setTimeout(() => {
			let filterEl = $(this.filterInput.nativeElement);
			let filterValue = ($(filterEl[0]).val() || '').toUpperCase();

			let tr = $(this.tbody.nativeElement).children("tr");
			
			for (let i=0; i<tr.length; i++) {
				let td = $(tr[i]).children("td");
				let found = false;

				for (let j=0; j<td.length; j++) {
					const trText = ($(td[j]).text() || '').toUpperCase();
					if (trText.indexOf(filterValue) > -1) found = true;
				}
				
				if(found) $(tr[i]).css('display', '');
				else $(tr[i]).css('display', 'none');
			}
		});
	}
}