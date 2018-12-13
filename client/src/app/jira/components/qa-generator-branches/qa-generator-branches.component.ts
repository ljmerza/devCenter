import { Component, OnInit, Input } from '@angular/core';
import {
  NgForm, FormGroup, FormControl, Validators,
  FormBuilder, AbstractControl, ValidationErrors, FormArray
} from '@angular/forms';

@Component({
  selector: 'dc-qa-generator-branches',
  templateUrl: './qa-generator-branches.component.html',
  styleUrls: ['./qa-generator-branches.component.css']
})
export class QaGeneratorBranchesComponent implements OnInit {

  loadingBranches: boolean = false;
  @Input() branchesFormArray: FormArray;
  @Input() ticket;
  constructor() { }

  ngOnInit() {
  }


  /**
	* getter for branches array
	* @return {FormArray}
	*/
  get branches(): FormArray {
    return this.branchesFormArray.get('branches') as FormArray;
  };

  /**
   * Adds a new branch to the branches form array. Adds subscription to
   * value change on repository selection to get all branches for that repository.
   * @param {Object} the new branch object to add to the ngForm
   */
  addBranch(newBranch) {
    let repositoryName = new FormControl(newBranch.repositoryName || '');

    const branch = new FormGroup({
      allRepos: new FormArray([]),
      allBranches: new FormArray(newBranch.allBranches || []),
      allBranchedFrom: new FormArray(newBranch.allBranches || []),
      repositoryName,
      reviewedBranch: new FormControl(newBranch.reviewedBranch || ''),
      baseBranch: new FormControl(newBranch.baseBranch || '')
    });

    repositoryName.valueChanges.subscribe(repoName => this.getBranches(repoName, branch));
    this.branchesFormArray.push(branch);
  }
  
  /**
   * removes a branch from the branch form array.
   * @param {number} branchIndex the index of the branch to remove from the array.
   */
  removeBranch(branchIndex: number): void {
    this.branchesFormArray.removeAt(branchIndex);
  }

  /**
   * gets a repository's branch list and adds it to the corresponding branch form control.
   * @param {string} repoName the name of the repository
   * @param {FormControl} branch
   */
  getBranches(repoName, branch) {
    branch.setControl('allBranches', this.branchesFormArray.setValue(['Loading branches please wait...']));

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
        .forEach(this.addBranch.bind(this));
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
