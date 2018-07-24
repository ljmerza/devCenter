import { FormArray } from '@angular/forms';

/**
 * adds all branches related to a Jira ticket into the form object
 * @param {Array<Object>} branches 
 */
export function processBranches(branches): void {
	branches.forEach(repo => {
		
		// for each matching dev branch found get list of branches
		repo.branches.map( devBranch => {
			let baseBranch;
			if(repo.repo === 'external_modules') baseBranch = ['dev'];
			else baseBranch = this.getBaseBranch(repo.all);

			return {
				allRepos: this.repos,
				allBranches: repo.all,
				repositoryName: repo.repo,
				reviewedBranch: devBranch,
				baseBranch: baseBranch || ''
			};
		})
		.forEach(this.addBranch.bind(this));
	});
}

/**
 * gets all branches related to a Jira ticket.
 */
export function getTicketBranches(){
	this.loadingBranches = true;
	this.cd.detectChanges();

	// get all branches associated with this msrp
	this.gitBranches$ = this.git.getTicketBranches(this.msrp).subscribe(
		response =>{
			processBranches.call(this, response.data);
			this.loadingBranches = false;
			this.cd.detectChanges();
		},
		error => {
			this.jira.processErrorResponse(error),
			this.loadingBranches = false;
			this.cd.detectChanges();
		}
	);
}

/**
 * gets a repository's branch list and adds it to the corresponding branch form control.
 * @param {string} repoName the name of the repository
 * @param {FormControl} branch
 */
export function getBranches(repoName, branch) {
	branch.setControl('allBranches', this.formBuilder.array(['Loading branches please wait...']));
	this.cd.detectChanges();

	this.git.getBranches(repoName).subscribe( 
		branches => {
			branches.data.unshift('Select a branch');
			branch.setControl('allBranches', this.formBuilder.array(branches.data));
			this.cd.detectChanges();
		},
		error => this.toastr.showToast(this.git.processErrorResponse(error), 'error')
	);
}

/**
 * Adds a new branch to the branches form array. Adds subscription to
 * value change on repository selection to get all branches for that repository.
 * @param {Object} the new branch object to add to the ngForm
 */
export function addBranch(newBranch){
	let repositoryName = this.formBuilder.control(newBranch.repositoryName || '');

	const branch = this.formBuilder.group({
		allRepos: this.formBuilder.array(this.repos.map(repo => repo.name)),
		allBranches: this.formBuilder.array(newBranch.allBranches || []),
		allBranchedFrom: this.formBuilder.array(newBranch.allBranches || []),
		repositoryName,
		reviewedBranch: this.formBuilder.control(newBranch.reviewedBranch || ''),
		baseBranch: this.formBuilder.control(newBranch.baseBranch || '')
	});

	repositoryName.valueChanges.subscribe(repoName => getBranches.call(this, repoName, branch));
	(this.qaForm.get('branches') as FormArray).push(branch);
}

/**
 * removes a branch from the branch form array.
 * @param {number} branchIndex the index of the branch to remove from the array.
 */
export function removeBranch(branchIndex:number): void {
	(this.qaForm.get('branches') as FormArray).removeAt(branchIndex);
}

/**
 * gets the base branch that a branch branched off of.
 * @param {Array<Object>} repos list of all repos
 * @return {string} the matching base branch
 */
export function getBaseBranch(repos): string {

	// if sprint exists then try to get baseBranch from sprint name
	if(this.sprint){
		const branchBaseName = this.key.split('-');
		const branchBase = `${branchBaseName[0]}${this.sprint}`;
		let baseBranchFromSprint = repos.find(branch => branchBase === branch);

		if(baseBranchFromSprint){
			return baseBranchFromSprint;
		}
	}
	
	// if we couldn't find baseBranch from sprint then try to
	// get all short branch names with numbers in them and sort
	const selections = repos
		.filter(branch => branch.length < 15)
		.map(branch => branch.replace(/[^0-9.]/g,''))
		.sort();

	// get branch short branch name that has highest version found
	return repos.find( branch => branch.length < 15 && branch.includes(selections[selections.length-1]));
}