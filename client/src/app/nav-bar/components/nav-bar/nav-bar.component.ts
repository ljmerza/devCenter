import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { environment as env } from '@env/environment';
import { selectSettings } from '@app/settings/settings.selectors';

import { selectNavBarItems, selectLinks } from '../../nav-bar.selectors';
import { ActionNavBarRetrieve, ActionLinksRetrieve } from '../../nav-bar.actions';

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

  constructor(public store: Store<{}>) {}

  ngOnInit() {
    this.navBarItems$ = this.store.pipe(select(selectNavBarItems))
      .subscribe(navBarItems => (this.navBarItems = navBarItems));

    this.settings$ = this.store.pipe(select(selectSettings))
      .subscribe(settings => (this.settings = settings));

    this.links$ = this.store.pipe(select(selectLinks))
      .subscribe(settings => (this.settings = settings));

    this.store.dispatch(new ActionNavBarRetrieve());
    this.store.dispatch(new ActionLinksRetrieve());
  }

  ngOnDestroy(): void {
    this.navBarItems$.unsubscribe();
    this.settings$.unsubscribe();
    this.links$.unsubscribe();
  }

  public get devBaseUrl(): string {
    return `http://${this.settings.devServer}.${env.rootDomain}:${
      this.settings.port
    }`;
  }

  public get emberBaseUrl(): string {
    const isLocalUrl = this.settings.emberUrl === 'local';
    const port = isLocalUrl ? '4200' : this.settings.port;
    const hash = isLocalUrl ? '/#' : '';
    const server = isLocalUrl
      ? 'localhost'
      : `${this.settings.devServer}.${env.rootDomain}`;
    return `http://${server}:${port}/UD-ember${hash}`;
  }

  public get teamBaseUrl(): string {
    const isLocalUrl = this.settings.teamUrl === 'local';
    const port = isLocalUrl ? '4200' : this.settings.port;
    const hash = isLocalUrl ? '/#' : '';
    const server = isLocalUrl ? 'localhost' : `${this.settings.devServer}.${env.rootDomain}`;

    return `http://${server}:${port}/teamdbgui${hash}`;
  }

  public get templateBaseUrl(): string {
    const isLocalUrl = this.settings.tempUrl === 'local';
    const port = isLocalUrl ? '4200' : this.settings.port;
    const hash = isLocalUrl ? '/#' : '';
    const server = isLocalUrl ? 'localhost' : `${this.settings.devServer}.${env.rootDomain}`;

    return `http://${server}:${port}/templatetools{hash}`;
  }
}