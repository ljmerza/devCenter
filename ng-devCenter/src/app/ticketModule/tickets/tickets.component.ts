import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { NgProgress } from 'ngx-progressbar';

import { Subject, Observable, Subscription } from 'rxjs';
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
export class TicketsComponent implements OnInit {
	loadingTickets:boolean = true;
	ticketType:string; // type of tickets to get
	repos: Array<Repo>;

	dtTrigger:Subject<any> = new Subject();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;

	@select('tickets') getTickets$: Observable<Array<Ticket>>;
	@select('repos') getRepos$: Observable<Array<Repo>>;
	getReposSub$;

	dtOptions = {
		order: [[4, 'desc']],
		columnDefs: [
			{targets: [9,10], visible: false},
			{targets: 4, width: '10%'},
			{targets: [6,8,9,10], type: 'date'}
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
		public jira:JiraService, public user:UserService, public toastr: ToastrService, private git:GitService
	) {}
	
	/**
	 * On initialization of component, if user credentials exist get repository list.
	 * on route parameter event trigger, get URL parameter and get list
	 * of tickets based on URL parameter if user has credentials
	 */
	ngOnInit():void {

		if( !this.user.needRequiredCredentials() ){
			this.git.getRepos().subscribe(
				this.processRepos.bind(this),
				this.git.processErrorResponse.bind(this.git)
			);
			this.getTickets$.subscribe(this.processTickets.bind(this));

			this.route.paramMap.subscribe(params => {
				this.ticketType = params.get('filter') || 'mytickets';
				this.getTickets(true, true);
			});
		} 
		
		
	}

	/** 
	 * saves list of repositories and un-subscribed from getting list
	 * @param {Array<Repo>} the array of repositories to save on instance
	 */
	private processRepos(repos) {
		this.store.dispatch({type: Actions.repos, payload: repos.data });
	}

	/**
	 * Start loading animations and get tickets. Once store triggers tickets event,
	 * stop loading animations and re-render the data-table. If error then Toast error message.
	 * @param {Boolean} isHardRefresh if hard refresh skip localStorage retrieval and loading animations
	 */
	private getTickets(isHardRefresh:Boolean=false, showLoading:Boolean=false) {
		if(showLoading) this.loadingTickets = true;
		this.ngProgress.start();

		this.jira.getTickets(this.ticketType, isHardRefresh)
		.subscribe((response:APIResponse) => this.store.dispatch({type: Actions.newTickets, payload: response.data}),
			this.jira.processErrorResponse.bind(this.jira)
		);
	}

	/**
	 * If a list of tickets exist then process the end of ticket retrieval
	 * @param {Array<Tickets>} tickets
	 */
	private processTickets(tickets) {
		if(tickets && tickets.length > 0){
			this.ngProgress.done();
			this.loadingTickets = false;
			this.rerender();
		}
	}

	/**
	 * render the data-table. If instance of data-table already exists then
	 * destroy it first then render it
	 */
	private rerender():void {
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