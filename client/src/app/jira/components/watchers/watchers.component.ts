import { Component, Input, ChangeDetectionStrategy, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';

import { WatcherService } from '../../services/watcher.service';
import { selectProfile } from '@app/core/profile';
import { PanelComponent } from '@app/panel/components/panel/panel.component';
import { NotificationService } from '@app/core/notifications/notification.service';

@Component({
  selector: 'dc-watchers',
  templateUrl: './watchers.component.html',
  styleUrls: ['./watchers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WatchersComponent implements OnInit, OnDestroy {
  profile;
  profile$;

  watcherType:string = '';

  @Input() key: string = '';
  @Input() watchers: Array<any>;
  @ViewChild(PanelComponent) modal: PanelComponent;

  constructor(public store: Store<{}>, private service: WatcherService, private notifications: NotificationService) { }

  ngOnInit(){
    this.profile$ = this.store.pipe(select(selectProfile))
      .subscribe(profile => this.profile = profile);

      // set add/remove based on if we are a watcher for the ticket
    const watcherUsernames = this.watchers.map(watcher => watcher.username);
    this.watcherType = watcherUsernames.includes(this.profile.name) ? 'Remove' : 'Add';
  }

  ngOnDestroy() {
    this.profile$ && this.profile$.unsubscribe();
  }

  /**
   * 
   */
  openModal(){
    this.modal.openModal();
  }

  /**
   * 
   */
  closeModal(){
    this.modal.closeModal();
  }

  /**
   * remove or add as watch to ticket
   */
  onSubmit(){
    this.modal.closeModal();
    const apiCall = this.watcherType === 'Add' ? 'addWatcher' : 'removeWatcher';

    this.service[apiCall]({key: this.key, username: this.profile.name}).subscribe(
      () => {
        this.notifications.success(`Successfully ${this.watcherType}ed watcher for ${this.key}`);
        this.watcherType = this.watcherType === 'Add' ? 'Remove' : 'Add';
      },
      error => this.notifications.error(`Failed to ${this.watcherType} watcher for ${this.key}: ${error.data}`)
    )
  }
}
