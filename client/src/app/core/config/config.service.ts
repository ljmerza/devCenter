import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { environment as env } from '@env/environment';
import { LocalStorageService } from '../local-storage/local-storage.service';

import { Store, select } from '@ngrx/store';
import { selectSettings } from '@app/settings/settings.selectors';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService implements OnInit, OnDestroy {
  private settings$: Subscription;
  settings;

  constructor(private store: Store<{}>) {}

  ngOnInit(): void {
    this.settings$ = this.store
      .pipe(select(selectSettings))
      .subscribe(settings => (this.settings = settings));
  }

  ngOnDestroy(): void {
    this.settings$.unsubscribe();
  }

  get myWatchedTickets() {
    return encodeURIComponent(`watcher = ${this.settings.username}`);
  }

  get allMyTickets() {
    return encodeURIComponent(
      `assignee = ${this.settings.username} ORDER BY updated DESC`
    );
  }

  get myTickets() {
    return encodeURIComponent(
      `assignee = ${this.settings.username} AND resolution = unresolved`
    );
  }

  jiraFields =
    'attachment,fixVersions,timeoriginalestimate,customfield_10109,status,customfield_10212,summary,assignee,components,timetracking,duedate,comment,updated,created,customfield_10102,customfield_10175,customfield_10103,customfield_10602,customfield_10300,customfield_10138,description,customfield_10002';
}
