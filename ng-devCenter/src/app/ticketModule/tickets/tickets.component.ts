import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
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
export class TicketsComponent implements OnInit {
	loadingTickets:boolean = false;
	loadingIcon: boolean = false;
	ticketListType:string; // type of tickets to get
	repos: Array<Repo>;
	filteredTickets = [];
	tickets = [];
	getTickets$;
	renderTimeoutId;
	ticketsRedux$;

	allTicketStatuses: Array<string>: [];

	@select('repos') getRepos$: Observable<Array<Repo>>;

	@ViewChild('table') table:ElementRef
	@ViewChild('tbody') tbody:ElementRef
	@ViewChild('filterInput') filterInput:ElementRef
	@ViewChild('statusDropdown') statusDropdown:ElementRef

	get tableTitle(){
		return `${this.jira.title} Tickets`;
	}

	constructor(
		public ngProgress: NgProgress, public route:ActivatedRoute, private store:NgRedux<RootState>,
		public jira:JiraService, public user:UserService
	) {}
	
	/**
	 * On initialization of component, if user credentials exist get repository list.
	 * on route parameter event trigger, get URL parameter and get list
	 * of tickets based on URL parameter if user has credentials
	 */
	ngOnInit():void {
		if(this.user.needRequiredCredentials()) return;

		this.route.paramMap.subscribe((routeResponse:any) => {
			this.ticketListType = routeResponse.params.filter || 'mytickets';
			this.store.dispatch({type: Actions.ticketType, payload: this.ticketListType });

			this.filterTable();
			this.getTickets();
				
			if(this.ticketsRedux$) this.ticketsRedux$.unsubscribe();
			this.ticketsRedux$ = this.store.select(this.ticketListType)
			.subscribe(tickets => this.processTickets({tickets: tickets || []}));
		});
	}

	/**
	 *	destroy any subscribers
	 */
	ngOnDestroy(){
		if(this.ticketsRedux$) this.ticketsRedux$.unsubscribe();
		if(this.getTickets$) this.getTickets$.unsubscribe();

		if(this.table.nativeElement) $(this.table.nativeElement).trigger('destroy');
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
	private processTickets({tickets}) {
		if(tickets.length === 0) {
			this.loadingTickets = true;
			return;
		}

		this.loadingTickets = false;
		this.tickets = tickets;

		this.getStatusList({tickets});
		this.filterByStatus({reset:true});

		this.filterTable();
		this.addSortTable();
	}

	/**
	 * get all uniquer ticket statuses from ticket list
	 */
	private getStatusList({tickets}){
		this.allTicketStatuses = tickets
			.map(ticket => ticket.status)
			.reduce((acc, d) => acc.includes(d) ? acc : acc.concat(d), []);
	}

	/**
	 * filter the ticket list by chosen status from the dropdown
	 * @param {boolean} reset do we want to reset the status selection?
	 */
	filterByStatus({reset=false}={}){
		let filterValue = '';

		if(!reset){
			let filterEl = $(this.statusDropdown.nativeElement);
			filterValue = $(filterEl[0]).val();
		}

		if(!filterValue) this.filteredTickets = this.tickets;
		else this.filteredTickets = this.tickets.filter(ticket => ticket.status === filterValue);
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