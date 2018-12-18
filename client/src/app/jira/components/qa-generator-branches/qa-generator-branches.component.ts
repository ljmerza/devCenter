import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import {
  NgForm, FormGroup, FormControl, Validators,
  FormBuilder, AbstractControl, ValidationErrors, FormArray
} from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { NotificationService } from '@app/core/notifications/notification.service';
import { selectRepos, Repo } from '@app/core/repos';
import { BranchInfoService } from '../../services';

import { environment as env } from '@env/environment';


@Component({
  selector: 'dc-qa-generator-branches',
  templateUrl: './qa-generator-branches.component.html',
  styleUrls: ['./qa-generator-branches.component.css']
})
export class QaGeneratorBranchesComponent implements OnInit, OnDestroy {
  env = env
  loadingBranches: boolean = false;
  @Input() qaForm: FormGroup;
  @Input() ticket;

  repos$: Subscription;
  allRepos: FormArray;

  getRepos$: Subscription; 

  defaultBranchMessage: string = 'Select a Repo';
  defaultSelectBranchMessage: string = 'Select a Branch';
  defaultBranchLoadingMessage:string = 'Loading branches please wait...';

  constructor(public store: Store<{}>, private fb: FormBuilder, private gitService: BranchInfoService, private notifications: NotificationService) { }

  ngOnInit() {
    this.repos$ = this.store.pipe(select(selectRepos))
      .subscribe((repos:Repo[]) => {
        this.allRepos = this.fb.array(repos);
      });
    
      // if we have no branches selected then try to auto get them
    if (!this.selectedRepos.length) this.getTicketBranches();
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
   * make sure the input isn't a default value
   * @param value 
   * @return {boolean}
   */
  isInvalidOption(value) {
    return [this.defaultBranchMessage, this.defaultBranchLoadingMessage, this.defaultSelectBranchMessage].includes(value);
  }

  /**
   * Adds a new branch to the branches form array. subscribes to
   * value change on repository selection to get all branches for that repository.
   * @param {Object} newBranch the new branch object to add to the ngForm
   */
  addRepo(newBranch) {
    const { repoChoice='', allBranches='', allBranchesChoice='', allBranchedFromChoice='' } = newBranch;

    const repo = new FormGroup({
      allRepos: this.allRepos,
      allReposChoice: new FormControl(repoChoice || this.defaultBranchMessage),
      allBranches: new FormArray(allBranches || [new FormControl(this.defaultBranchMessage)]),
      allBranchesChoice: new FormControl(allBranchesChoice || this.defaultBranchMessage),
      allBranchedFrom: new FormArray(allBranches || [new FormControl(this.defaultBranchMessage)]),
      allBranchedFromChoice: new FormControl(allBranchedFromChoice ||  this.defaultBranchMessage),
      diffLink: new FormControl(this.generateDiffLink({repoChoice, allBranchesChoice, allBranchedFromChoice}))
    });


    // watch for repo cahnges to fetch branches for that repo
    // and generate diff link if we have enough info
    repo.get('allReposChoice').valueChanges.subscribe(repoName => {
      this.getBranches(repoName, repo);
      this.generateDiffOnChange(repo);
    });

    repo.get('allBranchesChoice').valueChanges.subscribe(() => this.generateDiffOnChange(repo));
    repo.get('allBranchedFromChoice').valueChanges.subscribe(() => this.generateDiffOnChange(repo));

    // add new repo to array of repos
    this.selectedRepos.push(repo);
  }

  /**
   * on repo dropdown change, try to generate a diff link
   * @param repo 
   */
  generateDiffOnChange(repo){
    const repoChoice = repo.get('allReposChoice').value;
    const allBranchesChoice = repo.get('allBranchesChoice').value;
    const allBranchedFromChoice = repo.get('allBranchedFromChoice').value;
    
    const diffLink = this.generateDiffLink({ repoChoice, allBranchesChoice, allBranchedFromChoice });
    repo.patchValue({ diffLink });
  }

  
  /**
   * removes a repo from the repo form array.
   * @param {number} repoIndex the index of the branch to remove from the array.
   */
  removeBranch(repoIndex: number): void {
    this.selectedRepos.removeAt(repoIndex);
  }

  /**
   * gets a repository's branch list and adds it to the corresponding branch form control.
   * @param {string} repoName the name of the repository
   * @param {FormGroup} branch
   */
  getBranches(repoName: string, repo: FormGroup) {

    // set loading for branches inputs 
    repo.patchValue({
      allBranches: [this.defaultBranchLoadingMessage],
      allBranchesChoice: this.defaultBranchLoadingMessage,
      allBranchedFrom: [this.defaultBranchLoadingMessage],
      allBranchedFromChoice: this.defaultBranchLoadingMessage,
      diffLink: '',
    });
    
    // fetch list of branches for a repo and save on form
    this.gitService.getRepoBranches(repoName).subscribe(
      branches => {
        branches.data.unshift(this.defaultSelectBranchMessage);

        // set default selection and lsit of selections
        repo.setControl('allBranches', this.fb.array(branches.data));
        repo.get('allBranchesChoice').setValue(this.defaultSelectBranchMessage);
        repo.setControl('allBranchedFrom', this.fb.array(branches.data));
        repo.get('allBranchedFromChoice').setValue(this.defaultSelectBranchMessage);
      },
      error => {
        this.notifications.error(`Could not get repo branches: ${error.data}`);
      }
    );
  }

  /**
   * gets all branches related to a Jira ticket.
   */
  getTicketBranches() {
    this.loadingBranches = true;

    // get all branches associated with this msrp
    this.getRepos$ = this.gitService.getTicketBranches(this.ticket.msrp).subscribe(
      response => {
        this.processBranches(response.data);
        this.loadingBranches = false;
      },
      error => {
        this.notifications.error(`Could not get ticket branches: ${error.data}`);
        this.loadingBranches = false;
      }
    );
  }

  /**
   * cancels getting the ticket's branches
   */
  cancelGetTiccketBrances(){
    this.getRepos$.unsubscribe();
    this.loadingBranches = false;
  }

  /**
   * adds all branches related to a Jira ticket into the form object
   * @param {Array<Object>} branches 
   */
  processBranches(repos): void {
    repos.forEach(repo => {
      // create list of all branches
      const allBranches: FormControl[] = repo.all.map(repo => new FormControl(repo));

      // for each matching dev branch found get list of branches
      repo.branches.map(devBranch => {
        let baseBranch;
        if (repo.repo === 'external_modules') baseBranch = 'dev';
        else baseBranch = this.getBaseBranch(repo.all);
        

        return {
          repoChoice: repo.repo,
          allBranches: allBranches,
          allBranchesChoice: devBranch || '',
          allBranchedFrom: allBranches,
          allBranchedFromChoice: baseBranch || ''
        };
      })
      // add each branch found to form
      .forEach(this.addRepo.bind(this));

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

  /**
   * generates a code cloud diff link
   * @param repoChoice 
   * @param allBranchesChoice 
   * @param allBranchedFromChoice 
   */
  generateDiffLink({repoChoice, allBranchesChoice, allBranchedFromChoice}): string {
    const canCreateDiff = repoChoice && allBranchesChoice && allBranchedFromChoice;

    if (!canCreateDiff || this.isInvalidOption(repoChoice) || this.isInvalidOption(allBranchesChoice) || this.isInvalidOption(allBranchedFromChoice)) {
      return '';
    }

    return `${env.codeCloudUrl}/projects/${env.codeCloudProject}/repos/${repoChoice}/compare/diff?targetBranch=refs%2Fheads%2F${allBranchedFromChoice}&sourceBranch=refs%2Fheads%2F${allBranchesChoice}`;
  }

}
