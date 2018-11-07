import browser from 'browser-detect';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, Router, NavigationEnd } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  AnimationsService, routeAnimations,
  TitleService, AppState, LocalStorageService
} from '@app/core';
import { environment as env } from '@env/environment';

import { selectSettings } from './settings/settings.selectors';
import { SettingsState } from './settings/settings.model';

@Component({
  selector: 'dc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routeAnimations]
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject<void>();

  @HostBinding('class')
  componentCssClass;

  isProd = env.production;
  envName = env.envName;
  version = env.versions.app;
  year = new Date().getFullYear();

  settings: SettingsState;

  constructor(
    public overlayContainer: OverlayContainer,
    private store: Store<AppState>,
    private router: Router,
    private titleService: TitleService,
    private storageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.subscribeToSettings();
    this.subscribeToRouterEvents();
    this.storageService.testLocalStorage();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private subscribeToSettings() {
    this.store.pipe(select(selectSettings), takeUntil(this.unsubscribe$))
      .subscribe(settings => {
        this.settings = settings;
        this.setTheme(settings);
      });
  }

  private setTheme(settings: SettingsState) {
    const { theme = '' } = settings;

    const effectiveTheme = theme.toLowerCase();
    this.componentCssClass = effectiveTheme;

    const classList = this.overlayContainer.getContainerElement().classList;
    const toRemove = Array.from(classList).filter((item: string) => item.includes('-theme'));

    if (toRemove.length) {
      classList.remove(...toRemove);
    }

    classList.add(effectiveTheme);
  }

  private subscribeToRouterEvents() {
    this.router.events.pipe(takeUntil(this.unsubscribe$)).subscribe(event => {
      if (event instanceof ActivationEnd) {
        this.titleService.setTitle(event.snapshot);
      }
    });
  }
}
