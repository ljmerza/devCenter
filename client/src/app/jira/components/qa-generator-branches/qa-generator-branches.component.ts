import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import {
  NgForm, FormGroup, FormControl, Validators,
  FormBuilder, AbstractControl, ValidationErrors, FormArray
} from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { selectRepos, Repo } from '@app/core/repos';

@Component({
  selector: 'dc-qa-generator-branches',
  templateUrl: './qa-generator-branches.component.html',
  styleUrls: ['./qa-generator-branches.component.css']
})
export class QaGeneratorBranchesComponent implements OnInit, OnDestroy {

  loadingBranches: boolean = false;
  @Input() qaForm: FormGroup;
  @Input() ticket;

  repos$: Subscription;
  allRepos: FormArray;

  defaultBranchMessage: string = 'Select a Repo';
  defaultSelectBranchMessage: string = 'Select a Branch';
  defaultBranchLoadingMessage:string = 'Loading branches please wait...';

  constructor(public store: Store<{}>, private fb: FormBuilder) { }

  ngOnInit() {
    this.repos$ = this.store.pipe(select(selectRepos))
      .subscribe((repos:Repo[]) => {
        this.allRepos = this.fb.array(repos);
        this.addBranch({})
      });
  }

  ngOnDestroy() {
    this.repos$.unsubscribe();
  }

  /**
	* getter for branches array
	* @return {FormArray}
	*/
  get selectedRepos(): FormArray {
    return this.qaForm.get('repos') as FormArray;
  };

  /**
   * 
   * @param value 
   */
  isInvalidOption(value) {
    return [this.defaultBranchMessage, this.defaultBranchLoadingMessage, this.defaultSelectBranchMessage].includes(value);
  }

  /**
   * Adds a new branch to the branches form array. subscribes to
   * value change on repository selection to get all branches for that repository.
   * @param {Object} newBranch the new branch object to add to the ngForm
   */
  addBranch(newBranch) {
    const allReposChoice = new FormControl(newBranch.repoChoice || this.defaultBranchMessage);

    const branch = new FormGroup({
      allRepos: this.allRepos,
      allReposChoice,
      allBranches: new FormArray(newBranch.allBranches || [new FormControl(this.defaultBranchMessage)]),
      allBranchesChoice: new FormControl(newBranch.allBranchesChoice || this.defaultBranchMessage),
      allBranchedFrom: new FormArray(newBranch.allBranches || [new FormControl(this.defaultBranchMessage)]),
      allBranchedFromChoice: new FormControl(newBranch.allBranchedFromChoice || this.defaultBranchMessage),
    });

    // watch for repo cahnges to fetch branches for that repo
    allReposChoice.valueChanges.subscribe(repoName => this.getBranches(repoName, branch));

    // add new repo to array of repos
    this.selectedRepos.push(branch);
  }
  
  /**
   * removes a branch from the branch form array.
   * @param {number} branchIndex the index of the branch to remove from the array.
   */
  removeBranch(branchIndex: number): void {
    this.selectedRepos.removeAt(branchIndex);
  }

  /**
   * gets a repository's branch list and adds it to the corresponding branch form control.
   * @param {string} repoName the name of the repository
   * @param {FormGroup} branch
   */
  getBranches(repoName:string, branch: FormGroup) {

    
    // set loading for branches inputs 
    branch.get('allBranches').setValue([this.defaultBranchLoadingMessage]);
    branch.get('allBranchesChoice').setValue(this.defaultBranchLoadingMessage);

    branch.get('allBranchedFrom').setValue([this.defaultBranchLoadingMessage]);
    branch.get('allBranchedFromChoice').setValue(this.defaultBranchLoadingMessage);
    
    console.log({ repoName, branch });
    // this.git.getBranches(repoName).subscribe(
    //   branches => {
    //     branches.data.unshift('Select a branch');
    //     branch.setControl('allBranches', this.formBuilder.array(branches.data));
    //     this.cd.detectChanges();
    //   },
    //   error => this.toastr.showToast(this.git.processErrorResponse(error), 'error')
    // );
  }

  /**
   * gets all branches related to a Jira ticket.
   */
  getTicketBranches() {
    this.loadingBranches = true;

    // // get all branches associated with this msrp
    // this.gitBranches$ = this.git.getTicketBranches(this.msrp).subscribe(
    //   response => {
    //     this.processBranches(response.data);
    //     this.loadingBranches = false;
    //     this.cd.detectChanges();
    //   },
    //   error => {
    //     this.jira.processErrorResponse(error),
    //       this.loadingBranches = false;
    //   }
    // );
  }

  /**
   * adds all branches related to a Jira ticket into the form object
   * @param {Array<Object>} branches 
   */
  processBranches(branches): void {
    branches.forEach(repo => {

      // for each matching dev branch found get list of branches
      repo.branches.map(devBranch => {
        let baseBranch;
        if (repo.repo === 'external_modules') baseBranch = ['dev'];
        else baseBranch = this.getBaseBranch(repo.all);

        return {
          // allRepos: this.repos,
          allBranches: repo.all,
          repositoryName: repo.repo,
          reviewedBranch: devBranch,
          baseBranch: baseBranch || ''
        };
      })

      // add each branch found to form
      .forEach(this.addBranch);

    });
  }


  /**
   * gets the base branch that a branch branched off of.
   * @param {Array<Object>} repos list of all repos
   * @return {string} the matching base branch
   */
  getBaseBranch(repos): string {
    const sprint = this.ticket && this.ticket.sprint || '';
    const key = this.ticket.key && this.ticket.key || '';

    // if sprint exists then try to get baseBranch from sprint name
    if (sprint) {
      const branchBaseName = key.split('-');
      const branchBase = `${branchBaseName[0]}${sprint}`;
      let baseBranchFromSprint = repos.find(branch => branchBase === branch);

      if (baseBranchFromSprint) {
        return baseBranchFromSprint;
      }
    }

    // if we couldn't find baseBranch from sprint then try to
    // get all short branch names with numbers in them and sort
    const selections = repos
      .filter(branch => branch.length < 15)
      .map(branch => branch.replace(/[^0-9.]/g, ''))
      .sort();

    // get branch short branch name that has highest version found
    return repos.find(branch => branch.length < 15 && branch.includes(selections[selections.length - 1]));
  }

}
