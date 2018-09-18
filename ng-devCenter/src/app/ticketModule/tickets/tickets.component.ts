import { 
	Component, OnInit, ViewChild, ViewEncapsulation,
	ElementRef, TemplateRef, ComponentFactoryResolver, ViewContainerRef 
} from '@angular/core';

import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';

import { ActivatedRoute } from '@angular/router';
import { ProgressBarComponent } from './../../shared/progress-bar/progress-bar.component';

import { Observable } from 'rxjs';
import 'rxjs/add/observable/interval';
import { select, NgRedux } from '@angular-redux/store';

import { UserService, JiraService, GitService, MiscService, ConfigService } from '@services';
import { RootState, Actions } from '@store';
import { Repo, APIResponse } from '@models';

import { TicketCommentsModalComponent } from './../../commentsModule/ticket-comments-modal/ticket-comments-modal.component';
import { WorkLogComponent } from './../work-log/work-log.component';
import { SetPingsComponent } from './../set-pings/set-pings.component';
import { TicketDetailsComponent } from './../ticket-details/ticket-details.component';
import { TicketStatusComponent } from './../ticket-status/ticket-status.component';
import { WatchersComponent } from './../watchers/watchers.component';

declare let $;

@Component({
	selector: 'dc-tickets',
	templateUrl: './tickets.component.html',
	styleUrls: ['./tickets.component.scss'],
	encapsulation: ViewEncapsulation.None,
	entryComponents: [
		SetPingsComponent, TicketDetailsComponent,
		TicketCommentsModalComponent, WorkLogComponent
	]
})
export class TicketsComponent implements OnInit {
	loadingTickets:boolean = false;
	loadingIcon: boolean = false;
	ticketListType:string; // type of tickets to get
	repos: Array<Repo>;
	tickets = [];
	filteredTickets = [];
	
	getTickets$;
	ticketsRedux$;
	allTicketStatuses: Array<string> = [];

	jqlLinks$;
	jqlLinks;
	title;

	detailsComponentRef = [];
	pingComponentRef = [];
	commentComponentRef = [];
	worklogComponentRef = [];

	defaultTitle = 'My Open';
	defaultJql = 'assignee = currentUser() AND resolution = Unresolved ORDER BY due DESC';
	@select('repos') getRepos$: Observable<Array<Repo>>;
	@ViewChild('myTable') table: any;
	@ViewChild(ProgressBarComponent) progressBar: ProgressBarComponent;

	constructor(
		public route:ActivatedRoute, private store:NgRedux<RootState>,
		public jira:JiraService, public user:UserService, public config: ConfigService, public misc: MiscService,
		private factoryResolver: ComponentFactoryResolver, private viewContRef: ViewContainerRef, private sanitizer: DomSanitizer
	) {}

	get tableTitle(){
		return `${this.title} Tickets`;
	}
	
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

			this.getTickets();
				
			this.ticketsRedux$ && this.ticketsRedux$.unsubscribe();
			this.ticketsRedux$ = this.store.select(this.ticketListType)
			.subscribe(tickets => this.processTickets({tickets}));
		});
	}

	/**
	 *	destroy any subscribers
	 */
	ngOnDestroy(){
		this.ticketsRedux$ && this.ticketsRedux$.unsubscribe();
		this.getTickets$ && this.getTickets$.unsubscribe();
		this.jqlLinks$ && this.jqlLinks$.unsubscribe();
	}

	public getJqlLinks(){
		this.jqlLinks$ = this.store.select('jqlLinks').subscribe((jqlLinks:any) => {
			this.jqlLinks = jqlLinks;
		});
	}

	/**
	 * Start loading animations and get tickets. Once store triggers tickets event,
	 * stop loading animations and re-render the data-table. If error then Toast error message.
	 * @param {Boolean} isHardRefresh if hard refresh skip localStorage retrieval and loading animations
	 */
	public getTickets() {
		if(this.getTickets$) this.getTickets$.unsubscribe();
		this.progressBar.end();
		this.progressBar.start();
		this.loadingIcon = true;


		this.jqlLinks$ = this.store.select('fullJqls').subscribe((jqlLinks:any) => {
			if(!jqlLinks || jqlLinks.length === 0) return;

			this.jqlLinks = jqlLinks;
			const matchingJql = this.jqlLinks.find(link => link.name === this.ticketListType);
			const jql = matchingJql && matchingJql.query || this.defaultJql;
			this.title = matchingJql && matchingJql.display_name || this.defaultTitle;

			this.getTickets$ = this.jira.getTickets(this.ticketListType, true, jql).subscribe((response:APIResponse) => {
				this.progressBar.end();
				this.loadingIcon = false;
				this.store.dispatch({type: Actions.newTickets, payload: response.data});
			},
				this.jira.processErrorResponse.bind(this.jira)
			);
		});
	}

	/**
	 * stops the loading of tickets
	 */
	stopGetTickets(){
		if(this.getTickets$) this.getTickets$.unsubscribe();
		this.loadingIcon = false;
		this.loadingTickets = false;
		this.progressBar.end();
	}

	/**
	 * If a list of tickets exist then process the end of ticket retrieval
	 * @param {Array<Ticket>} tickets
	 */
	private processTickets({tickets}) {

		// if we didn't get any ticket then we are loading for this first time
		if(!tickets || tickets.length == 0) {
			this.loadingTickets = true;
			this.tickets = [];
			this.filteredTickets = [];
			return;
		}

		this.loadingTickets = false;

		// wait for table to load before adding data for ngx-datatable to not freak out
		setTimeout(() => {
			this.tickets = tickets;
			this.filteredTickets = tickets;
		}, 100);
	}

	toggleExpandRow(ticket) {
		this.table.rowDetail.toggleExpandRow(ticket);
	}

	updateFilter(event) {
	    const val = event.target.value.toLowerCase();

	    // filter our data
	    const tickets = this.tickets.filter(ticket => {
			if((ticket.key || '').toLowerCase().indexOf(val) !== -1) return 1;
			else if((ticket.msrp || '').toLowerCase().indexOf(val) !== -1) return 1;
			
			else if((ticket.summary || '').toLowerCase().indexOf(val) !== -1) return 1;
			else if((ticket.status || '').toLowerCase().indexOf(val) !== -1) return 1;

			else if((ticket.customer_details.username || '').toLowerCase().indexOf(val) !== -1) return 1;
			else if((ticket.customer_details.display_name || '').toLowerCase().indexOf(val) !== -1) return 1;
			else if((ticket.user_details.username || '').toLowerCase().indexOf(val) !== -1) return 1;
			else if((ticket.user_details.display_name || '').toLowerCase().indexOf(val) !== -1) return 1;

			else return 0;
	    });

	    // update the rows
	    this.filteredTickets = tickets;
	    this.table.offset = 0;
	}

	dueDateComparator(valueA, valueB, rowA, rowB){
		let dueDateA = moment(rowA.dates.duedate, 'YYYY-MM-DD');
		let dueDateB = moment(rowB.dates.duedate, 'YYYY-MM-DD');

		if(dueDateA.isAfter(dueDateB)) return -1;
		else if(dueDateB.isAfter(dueDateA)) return 1;
		else return 0;
	}

	createdDateComparator(valueA, valueB, rowA, rowB){
		let startedA = moment(rowA.dates.started, 'YYYY-MM-DD');
		let startedB = moment(rowB.dates.started, 'YYYY-MM-DD');

		if(startedA.isAfter(startedB)) return -1;
		else if(startedB.isAfter(startedA)) return 1;
		else return 0;
	}

	lastUpdateComparator(valueA, valueB, rowA, rowB){
		let updatedA = moment(rowA.dates.started, 'YYYY-MM-DD');
		let updatedB = moment(rowB.dates.started, 'YYYY-MM-DD');

		if(updatedA.isAfter(updatedB)) return -1;
		else if(updatedB.isAfter(updatedA)) return 1;
		else return 0;
	}
}