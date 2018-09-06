import { 
	Component, OnInit, ViewChild, ViewEncapsulation,
	ElementRef, TemplateRef, ComponentFactoryResolver, ViewContainerRef 
} from '@angular/core';

import { DomSanitizer } from '@angular/platform-browser';

import { ActivatedRoute } from '@angular/router';
import { NgProgress } from 'ngx-progressbar';

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

	constructor(
		public ngProgress: NgProgress, public route:ActivatedRoute, private store:NgRedux<RootState>,
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
		if(this.ngProgress) this.ngProgress.done();
		this.ngProgress.start();
		this.loadingIcon = true;


		this.jqlLinks$ = this.store.select('fullJqls').subscribe((jqlLinks:any) => {
			if(!jqlLinks || jqlLinks.length === 0) return;

			this.jqlLinks = jqlLinks;
			const matchingJql = this.jqlLinks.find(link => link.name === this.ticketListType);
			const jql = matchingJql && matchingJql.query || this.defaultJql;
			this.title = matchingJql && matchingJql.display_name || this.defaultTitle;

			this.getTickets$ = this.jira.getTickets(this.ticketListType, true, jql).subscribe((response:APIResponse) => {
				this.ngProgress.done();
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
		this.ngProgress.done();
	}

	/**
	 * If a list of tickets exist then process the end of ticket retrieval
	 * @param {Array<Ticket>} tickets
	 */
	private processTickets({tickets}) {
		if(!tickets || tickets.length == 0) {
			this.loadingTickets = true;
			return;
		}

		this.loadingTickets = false;
		this.tickets = tickets;
	}

	toggleExpandRow(row) {
		console.log({row});
		this.table.rowDetail.toggleExpandRow(row);
	}

	/**
	 * creates a ticket additional details modal if one doesn't exist then opens it
	 */
	openAdditionalDataModal(ticket){
		let matchingRef = this.detailsComponentRef.find(ref => ref.key === ticket.key);
		
		if(!matchingRef){
			const factory = this.factoryResolver.resolveComponentFactory(TicketDetailsComponent);
		    matchingRef = {component: this.viewContRef.createComponent(factory), key: ticket.key};

		    (<TicketDetailsComponent>matchingRef.component.instance).key = ticket.key;

		    this.detailsComponentRef.push(matchingRef);
		}

	    (<TicketDetailsComponent>matchingRef.component.instance).openModal();
	}

	/**
	 * creates a ticket ping modal if one doesn't exist then opens it
	 */
	openPingModal(ticket) {
		let matchingRef = this.pingComponentRef.find(ref => ref.key === ticket.key);

		if(!matchingRef){
			const factory = this.factoryResolver.resolveComponentFactory(SetPingsComponent);
	    	matchingRef = {component: this.viewContRef.createComponent(factory), key: ticket.key};

	    	(<SetPingsComponent>matchingRef.component.instance).key = ticket.key;
	    	(<SetPingsComponent>matchingRef.component.instance).masterBranch = ticket.master_branch;
	    	(<SetPingsComponent>matchingRef.component.instance).branch = ticket.branch;
	    	(<SetPingsComponent>matchingRef.component.instance).commit = ticket.commit;

	    	this.pingComponentRef.push(matchingRef);
	    }

    	(<SetPingsComponent>matchingRef.component.instance).openModal();
    }


	/**
	 * creates a ticket comments modal if one doesn't exist then opens it
	 */
	openCommentsModal(ticket) {
		let matchingRef = this.commentComponentRef.find(ref => ref.key === ticket.key);

		if(!matchingRef){
			const factory = this.factoryResolver.resolveComponentFactory(TicketCommentsModalComponent);
    		matchingRef = {component: this.viewContRef.createComponent(factory), key: ticket.key};

    		(<TicketCommentsModalComponent>matchingRef.component.instance).key = ticket.key;

    		this.commentComponentRef.push(matchingRef);
    	}

    	(<TicketCommentsModalComponent>matchingRef.component.instance).openModal();
	}

	/**
	 * creates a ticket log modal if one doesn't exist then opens it
	 */
	openLogModal(ticket) {
		let matchingRef = this.worklogComponentRef.find(ref => ref.key === ticket.key);

		if(!matchingRef){
			const factory = this.factoryResolver.resolveComponentFactory(WorkLogComponent);
	    	matchingRef = {component: this.viewContRef.createComponent(factory), key: ticket.key};

	    	(<WorkLogComponent>matchingRef.component.instance).key = ticket.key;
	    	(<WorkLogComponent>matchingRef.component.instance).branch = ticket.branch;
	    	(<WorkLogComponent>matchingRef.component.instance).masterBranch = ticket.master_branch;
	    	(<WorkLogComponent>matchingRef.component.instance).commit = ticket.commit;

	    	this.worklogComponentRef.push(matchingRef);
		}

    	(<WorkLogComponent>matchingRef.component.instance).openModal();
	}
}