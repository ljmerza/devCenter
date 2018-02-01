import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject, Observable, Subscription } from 'rxjs';
import 'rxjs/add/observable/interval';

import { UserService } from './../../shared/services/user.service';
import { JiraService } from './../../shared/services/jira.service';
import { ToastrService } from './../../shared/services/toastr.service';
import { WebSocketService } from './../../shared/services/web-socket.service';

import { select } from '@angular-redux/store';
import { DataTableDirective } from 'angular-datatables';
import { NgProgress } from 'ngx-progressbar';

import { Ticket } from './../../shared/store/models/ticket';
import { Repo } from './../../shared/store/models/repo';

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
	getTicketsSub$;
	getReposSub$;

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

	constructor(
		public ngProgress: NgProgress, public route:ActivatedRoute, 
		public jira:JiraService, public user:UserService, public toastr: ToastrService
	) {}
	
	/**
	 * On initialization of component, if user credentials exist get repository list.
	 * on route parameter event trigger, get URL parameter and get list
	 * of tickets based on URL parameter if user has credentials
	 */
	ngOnInit():void {
		if( !this.user.needRequiredCredentials() ){
			this.jira.getRepos();
			this.getRepos$.subscribe(this.processRepos.bind(this))
			this.getTickets$.subscribe(this.processTickets.bind(this));
		} 
		
		this.route.paramMap.subscribe(params => {
			this.ticketType = params.get('filter') || 'mytickets';
			if( !this.user.needRequiredCredentials() ) this.getTickets();
		});
	}

	/** 
	 * saves list of repositories and un-subscribed from getting list
	 * @param {Array<Repo>} the array of repositories to save on instance
	 */
	private processRepos(repos) {
		if(repos){
			this.repos = repos;
			if(this.getReposSub$) this.getReposSub$.unsubscribe();
		}
	}

	/**
	 * Start loading animations and get tickets. Once store triggers tickets event,
	 * stop loading animations and re-render the data-table. If error then Toast error message.
	 * @param {Boolean} isHardRefresh if hard refresh skip localStorage retrieval and loading animations
	 */
	private getTickets(isHardRefresh:Boolean=false) {
		if(isHardRefresh) this.loadingTickets = false;
		this.ngProgress.start();
		this.jira.getTickets(this.ticketType, isHardRefresh);
	}

	/**
	 * If a list of tickets exist then process the end of ticket retrieval
	 * @param {Array<Tickets>} tickets
	 */
	private processTickets(tickets) {
		if(tickets && tickets.length > 0){
			// this.getTicketsSub$.unsubscribe();
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