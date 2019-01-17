import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { environment as env } from '@env/environment';
import { selectSettings } from '@app/settings/settings.selectors';

import { selectNavBarItems, selectLinks } from '../../selectors';
import { ActionNavBarRetrieve, ActionLinksRetrieve } from '../../actions';
import { ProfileService } from '@app/core/profile';

@Component({
  selector: 'dc-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
  private settings$: Subscription;
  private navBarItems$: Subscription;
  private links$: Subscription;

  navBarItems;
  settings;
  links;

  env = env;
  logo = require('@app/../assets/logo.png');

  constructor(public store: Store<{}>, public profileService: ProfileService) {}

  ngOnInit() {
    this.navBarItems$ = this.store.pipe(select(selectNavBarItems))
      .subscribe(navBarItems => this.navBarItems = navBarItems);

    this.settings$ = this.store.pipe(select(selectSettings))
      .subscribe(settings => this.settings = settings);

    this.links$ = this.store.pipe(select(selectLinks))
      .subscribe(links => this.links = links);

    this.store.dispatch(new ActionNavBarRetrieve());
    this.store.dispatch(new ActionLinksRetrieve());
  }

  ngOnDestroy(): void {
    this.navBarItems$.unsubscribe();
    this.settings$.unsubscribe();
    this.links$.unsubscribe();
  }
}
