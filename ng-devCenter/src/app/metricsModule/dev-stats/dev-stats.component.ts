import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, NgRedux } from '@angular-redux/store';
import { NgProgress } from 'ngx-progressbar';

import { Subject, Observable, Subscription } from 'rxjs';
import { JiraService, ToastrService, UserService } from '@services';

import { RootState, Actions } from '@store';
import { Repo, Ticket, APIResponse } from '@models';

import { statuses } from '../../shared/store/models/ticket-statuses';

@Component({
	selector: 'dc-dev-stats',
	templateUrl: './dev-stats.component.html',
	styleUrls: ['./dev-stats.component.scss']
})
export class DevStatsComponent implements OnInit {
	loadingTickets:boolean = false;

	customUserStats =  {
		logged: 0,
		estimate: 0
	};

	getTicketsSub$;
	@select('tickets') getTickets$: Observable<Array<Ticket>>;

	constructor(public ngProgress: NgProgress, private jira:JiraService, private store:NgRedux<RootState>, public user:UserService, public route:ActivatedRoute) { }

	ngOnInit() {
		if(this.user.needRequiredCredentials()) return;

		this.getTickets$.subscribe(this.processTickets.bind(this));
		this.route.paramMap.subscribe(params => {
			if(this.getTicketsSub$) this.getTicketsSub$.unsubscribe();
			this.getTickets(true);
		});
	}

	/**
	 * Start loading animations and get tickets. Once store triggers tickets event,
	 * stop loading animations and re-render the data-table. If error then Toast error message.
	 * @param {Boolean} isHardRefresh if hard refresh skip localStorage retrieval and loading animations
	 */
	public getTickets(showLoading:Boolean=false) {
		if(showLoading) this.loadingTickets = true;
		this.ngProgress.start();

		this.getTicketsSub$ = this.jira.getTickets('allopen', true)
		.subscribe((response:APIResponse) => {
			this.store.dispatch({type: Actions.newTickets, payload: response.data})
		},
			this.jira.processErrorResponse.bind(this.jira)
		);
	}

	userProfilesStart = {};
	/**
	 * If a list of tickets exist then process the end of ticket retrieval
	 * @param {Array<Tickets>} tickets
	 */
	private processTickets(tickets) {
		this.ngProgress.done();
		this.loadingTickets = false;

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

			// create or merge new user profile data
			userProfiles[username] = {
				tickets: [...(userProfiles[username] || {}).tickets || [], userStatTicket],
				loggedTotal: ((userProfiles[username] || {}).loggedTotal || 0) + userStatTicket.loggedSeconds,
				estimateTotal: ((userProfiles[username] || {}).estimateTotal || 0) + userStatTicket.estimateSeconds
			};

			// add UCT ready stats
			const loggedSecondsAddition = userStatTicket.status === statuses.UCTREADY.frontend ? userStatTicket.loggedSeconds : 0;
			const estimateSecondsAddition = userStatTicket.status === statuses.UCTREADY.frontend ? userStatTicket.estimateSeconds : 0;
			userProfiles[username].loggedSecondsDone = (userProfiles[username].loggedSecondsDone || 0) + estimateSecondsAddition;
			userProfiles[username].estimateSecondsDone = (userProfiles[username].estimateSecondsDone || 0) + estimateSecondsAddition;

			return userProfiles;
		}, this.userProfilesStart);


		console.log({alluserProfiles, tickets});


		

	}

	_

}
