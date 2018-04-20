import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { NgProgress } from 'ngx-progressbar';
import { DatatableComponent } from '@swimlane/ngx-datatable';

import { Subscription } from 'rxjs';
import { JiraService, ToastrService, UserService, ConfigService } from '@services';

import { RootState, Actions } from '@store';
import { Repo, Ticket, APIResponse } from '@models';

import { statuses } from '../../shared/store/models/ticket-statuses';

@Component({
	selector: 'dc-dev-stats',
	templateUrl: './dev-stats.component.html',
	styleUrls: ['./dev-stats.component.scss']
})
export class DevStatsComponent implements OnInit, OnDestroy {
	loadingTickets:boolean = false;

	sprints: Array<string> = [];
	selectedSprint:string = '';
	tableTitle:string = '';
	ticketListType:string = 'allopen';

	profile$;
	userProfiles:Array<any> = [];
	tickets$:Subscription;
	@ViewChild(DatatableComponent) table: DatatableComponent;

	constructor(
		public ngProgress: NgProgress, private jira:JiraService, private store:NgRedux<RootState>, 
		public user:UserService, public route:ActivatedRoute, public config:ConfigService
	) { }

	/**
	 *
	 */
	ngOnInit() {
		if(this.user.needRequiredCredentials()) return;

		this.sprints = Object.keys(this.config.sprintVersions).sort();
		this.selectedSprint = this.sprints[this.sprints.length-1];
		this.tableTitle = `${this.selectedSprint} Metrics`;

		this.tickets$ = this.store.select(this.ticketListType).subscribe(this.processTickets.bind(this));
		this.getMetrics();
	}

	/**
	 *
	 */
	ngOnDestroy(){
		if(this.tickets$) this.tickets$.unsubscribe();
		if(this.profile$) this.profile$.unsubscribe();
	}

	/**
	 * Start loading animations and get tickets. Once store triggers tickets event,
	 * stop loading animations and re-render the data-table. If error then Toast error message.
	 * @param {Boolean} isHardRefresh if hard refresh skip localStorage retrieval and loading animations
	 */
	public getMetrics() {
		this.ngProgress.start();

		this.jira.getSprint(this.selectedSprint, true)
		.subscribe((response:APIResponse) => {
			response.data.listType = this.ticketListType;
			this.store.dispatch({type: Actions.newTickets, payload: response.data});
		},
			this.jira.processErrorResponse.bind(this.jira)
		);
	}
	
	/**
	 * @param {Array<Tickets>} tickets
	 */
	private processTickets(tickets) {
		this.loadingTickets = tickets.length === 0;
		if(tickets.length === 0) return;
		this.ngProgress.done();

		const INDEV = statuses.INDEV.frontend;
		const CRWORK = statuses.CRWORK.frontend;
		const CRFAIL = statuses.CRFAIL.frontend;
		const INQA = statuses.INQA.frontend;
		const QAFAIL = statuses.QAFAIL.frontend;
		const INUCT = statuses.INUCT.frontend;
		const UCTFAIL = statuses.UCTFAIL.frontend;

		const alluserProfiles = tickets.reduce((userProfiles, ticket) => {
			// create stats based ticket
			const userStatTicket:any = {
				key: ticket.key,
				msrp: ticket.msrp,
				status: ticket.status,
				loggedSeconds: parseInt(ticket.dates.logged_seconds || 0),
				estimateSeconds: parseInt(ticket.dates.estimate_seconds || 0),
			}

			const username = ticket.user_details.username;
			if(userProfiles[username]){
				userProfiles[username] = this._addNewData({ticket, userStatTicket, userProfiles, username});
			} else {
				userProfiles[username] = this._newUser({ticket, userStatTicket});
			}

			// add up ticket fails
			ticket.history.status.forEach(status => {
				let isQaFail = false;
				let isCrFail = false;
				let isUctFail = false;

				status.items.forEach(item => {
					isQaFail = (item.fromString === INQA && (!item.toString || item.toString === INDEV)) || [item.fromString, item.toString].includes(QAFAIL);
					isCrFail = (item.fromString === CRWORK && item.toString === INDEV) || [item.fromString, item.toString].includes(CRFAIL);
					isUctFail = (item.fromString === INUCT && (!item.toString || item.toString === INDEV)) || [item.fromString, item.toString].includes(UCTFAIL);
				});

				userProfiles[username].qaFails += (isQaFail ? 1: 0);
				userProfiles[username].crFails += (isCrFail ? 1: 0);
				userProfiles[username].uctFails += (isUctFail ? 1: 0);
			});

			return userProfiles;
		}, {});

		const userProfiles = Object.keys(alluserProfiles).map(user => {
			let userProfile = alluserProfiles[user];
			userProfile.percentLogged = (userProfile.loggedTotal / (userProfile.estimateTotal || 1) * 100).toFixed(0);
			userProfile.percentLoggedUct = (userProfile.loggedUctTotal / (userProfile.estimateUctTotal || 1) * 100).toFixed(0);
			userProfile.totalFails = userProfile.qaFails + userProfile.crFails + userProfile.uctFails;
			return {username:user, ...userProfile};	
		});

		// if admin then show all else only show that user
		this.profile$ = this.store.select('userProfile').subscribe((profile:any) => {
			if(!profile.name) return;

			if(profile.is_admin){
				this.userProfiles = userProfiles;
			} else {
				this.userProfiles = userProfiles.filter(user => user.username === profile.name);
			}

			this.userProfilesFitler = this.userProfiles;
		});
	}
	userProfilesFitler;

	/**
	 *
	 */
	_newUser({ticket, userStatTicket}){

		// create or merge new user profile data
		let newUserProfile:any = {
			tickets: [userStatTicket],
			loggedTotal: userStatTicket.loggedSeconds,
			estimateTotal: userStatTicket.estimateSeconds,
			userDetails: ticket.user_details,
			qaFails: 0,
			crFails: 0,
			uctFails: 0,
		};


		const loggedSecondsAddition = userStatTicket.status === statuses.UCTREADY.frontend ? userStatTicket.loggedSeconds : 0;
		const estimateSecondsAddition = userStatTicket.status === statuses.UCTREADY.frontend ? userStatTicket.estimateSeconds : 0;
		newUserProfile.loggedUctTotal = loggedSecondsAddition;
		newUserProfile.estimateUctTotal = estimateSecondsAddition;

		return newUserProfile;
	}

	/**
	 *
	 */
	_addNewData({ticket, userStatTicket, userProfiles, username}){
		const UCTREADY = statuses.UCTREADY.frontend;
		const INUCT = statuses.INUCT.frontend;
		const RELEASE = statuses.RELEASE.frontend;

		userProfiles[username].tickets.push(userStatTicket);
		userProfiles[username].loggedTotal += userStatTicket.loggedSeconds;
		userProfiles[username].estimateTotal += userStatTicket.loggedSeconds ? userStatTicket.estimateSeconds: 0;

		// add UCT ready stats
		userProfiles[username].loggedUctTotal += (userStatTicket.status === UCTREADY ? userStatTicket.loggedSeconds : 0);
		userProfiles[username].estimateUctTotal += (userStatTicket.status === UCTREADY ? userStatTicket.estimateSeconds : 0);

		return userProfiles[username];
	}

	/**
	 *
	 */
	updateFilter(event) {
		const inputValue = event.target.value.toLowerCase();

		this.userProfiles = this.userProfilesFitler.filter(user => {
			for(let prop in user){
				if(typeof(user[prop]) === 'string' && user[prop].includes(inputValue)){
					return true;
				} else if(typeof(user[prop]) === 'number' && user[prop] == inputValue){
					return true;
				}
			}

			return false;
		});

		this.table.offset = 0;
	}
}
