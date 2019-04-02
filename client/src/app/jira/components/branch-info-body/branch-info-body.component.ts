import {Component, ChangeDetectionStrategy, Input} from '@angular/core';

import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectProfile } from '@app/core/profile';


@Component({
	selector: 'dc-branch-info-body',
	templateUrl: './branch-info-body.component.html',
	styleUrls: ['./branch-info-body.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchInfoBodyComponent {
	profile$: Subscription;
	profile;

	@Input() sprint = '';
	@Input() branch = '';
	@Input() commit = '';
	@Input() key = '';
	@Input() epicLink = '';

	constructor(public store: Store<{}>) { }

	ngOnInit(){
		this.profile$ = this.store.pipe(select(selectProfile))
			.subscribe(profile => this.profile = profile);
	}

	get masterName() {
		if (this.sprint) return this.key.split('-')[0] + this.sprint;
		else return '';
	}

	get createNewCommand(){
		return `git checkout -b ${this.branch}; git push -u;`;
	}

	get mergeCommitCommand(){
		return `git merge --squash ${this.branch}; git commit -m "${this.commit}";`;
	}

	get mergeScriptCommand(){
		return `bash merge_ticket.sh "${this.profile.displayName}" REPOS "${this.commit}" ${this.masterName} ${this.branch} /opt/${this.profile.name}/merge_code ${this.profile.name};`;
	}

	get updateBranchCommand(){
		return `git pull origin ${this.masterName};git merge ${this.masterName};`;
	}
}
