import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { NgProgress } from 'ngx-progressbar';

import { DataTableDirective } from 'angular-datatables';
import { Subscription, Subject } from 'rxjs';
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
	loadingIndicator:boolean = false;
	ticketType:string = 'devstats';

	sprints: Array<string> = [];
	selectedSprint:string = '';
	tableTitle:string = '';

	getTickets$;
	profile$;
	userProfilesFilter;
	userProfiles:Array<any> = [];
	tickets$:Subscription;

	dtOptions = {
		dom: `
			<'row'<'col-sm-12'Bfl>>
			<'row'<'col-sm-12'tr>>
			<'row'<'col-sm-12'ip>>
		`,
		pageLength: 15,
		lengthMenu: [5, 10, 15, 20, 100],
		buttons: ['colvis'],
		stateSave: true,
		pagingType: 'full',
		language: {
			search: "",
        	searchPlaceholder: "Search User",
        	zeroRecords: 'No matching users found'
        }
	};

	dtTrigger:Subject<any> = new Subject();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;

	constructor(
		public ngProgress: NgProgress, private jira:JiraService, private store:NgRedux<RootState>, 
		public user:UserService, public route:ActivatedRoute, public config:ConfigService
	) { }

	/**
	 *
	 */
	ngOnInit() {
		if(this.user.needRequiredCredentials()) return;
		this.store.dispatch({type: Actions.ticketType, payload: this.ticketType });

		this.sprints = Object.keys(this.config.sprintVersions).sort();
		this.selectedSprint = this.sprints[this.sprints.length-1];
		this.tableTitle = `${this.selectedSprint} Metrics`;

		this.tickets$ = this.store.select(this.ticketType).subscribe(this.processTickets.bind(this));
		this.getMetrics();
	}

	ngAfterViewInit(): void {
    	this.dtTrigger.next();
	}

	/**
	 *
	 */
	ngOnDestroy(){
		if(this.tickets$) this.tickets$.unsubscribe();
		if(this.getTickets$) this.getTickets$.unsubscribe();
		if(this.profile$) this.profile$.unsubscribe();
	}

	/**
	 * Start loading animations and get tickets. Once store triggers tickets event,
	 * stop loading animations and re-render the data-table. If error then Toast error message.
	 * @param {Boolean} isHardRefresh if hard refresh skip localStorage retrieval and loading animations
	 */
	public getMetrics() {
		this.resetLoading();
		this.ngProgress.start();

		this.getTickets$ = this.jira.getSprint(this.selectedSprint, true)
		.subscribe((response:APIResponse) => {
			this.store.dispatch({type: Actions.newTickets, payload: response.data});
		},
			this.jira.processErrorResponse.bind(this.jira)
		);
	}

	/**
	 * resets loading variables
	 */
	private resetLoading(){
		if(this.ngProgress) this.ngProgress.done();
		if(this.getTickets$) this.getTickets$.unsubscribe();
	}
	
	/**
	 * @param {Array<Tickets>} tickets
	 */
	private processTickets(tickets=[]) {
		if(tickets.length === 0) {
			this.loadingIndicator = true;
			return;
		}

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
			const displayName = ticket.user_details.display_name;
			if(userProfiles[username]){
				userProfiles[username] = this._addNewData({ticket, userStatTicket, userProfiles, username, displayName});
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

			this.userProfilesFilter = this.userProfiles;

			this.dtElement && this.dtElement.dtInstance && this.dtElement.dtInstance.then((dtInstance:DataTables.Api) => {
				dtInstance.destroy();
				this.dtTrigger.next();
			});

			this.loadingIndicator = false;
			this.resetLoading();
		});
	}

	/**
	 * create a new user's profile
	 * @param {Object} ticket
	 * @param {Object} userStatTicket
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
	 * adds new data to an existing user
	 */
	_addNewData({ticket, userStatTicket, userProfiles, username, displayName}){
		const UCTREADY = statuses.UCTREADY.frontend;
		const INUCT = statuses.INUCT.frontend;
		const RELEASE = statuses.RELEASE.frontend;

		userProfiles[username].displayName = displayName;
		userProfiles[username].tickets.push(userStatTicket);
		userProfiles[username].loggedTotal += userStatTicket.loggedSeconds;
		userProfiles[username].estimateTotal += userStatTicket.loggedSeconds ? userStatTicket.estimateSeconds: 0;

		// add UCT ready stats
		userProfiles[username].loggedUctTotal += (userStatTicket.status === UCTREADY ? userStatTicket.loggedSeconds : 0);
		userProfiles[username].estimateUctTotal += (userStatTicket.status === UCTREADY ? userStatTicket.estimateSeconds : 0);

		return userProfiles[username];
	}
}
