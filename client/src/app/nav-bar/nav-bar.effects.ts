import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { environment as env } from '@env/environment';

import { NotificationService } from '@app/core/notifications/notification.service';

import { processJqlLinks } from'./jql.tool';
import { processNavBarItems } from'./navbar-items.tool';

import {
  NavBarActionTypes, ActionSearch,
  ActionOpenTicket, ActionOpenTicketError,
  ActionNavBarRetrieve, ActionNavBarSuccess, ActionNavBarError,
  ActionProfileRetrieve, ActionProfileSuccess, ActionProfileError,
  ActionLinksRetrieve, ActionLinksSuccess, ActionLinksError
} from './nav-bar.actions';

import { NavBarService } from './nav-bar.service';

@Injectable()
export class NavBarEffects {
  constructor(private actions$: Actions<Action>, private service: NavBarService, private notificationsService: NotificationService) {}

  @Effect()
  searchJiraTicket = () =>
    this.actions$.pipe(
      ofType<ActionSearch>(NavBarActionTypes.SEARCH),
      switchMap((action: ActionSearch) => {
        this.notificationsService.info(`Looking up key for ticket MSRP ${action.payload}`);

        return this.service.findJiraTicket(action.payload).pipe(
          map((response: any) => new ActionOpenTicket(response.data)),
          catchError(() => of(new ActionProfileError()))
        )
      })
    );

  @Effect({ dispatch: false })
  persistSettings = this.actions$.pipe(
    ofType<ActionOpenTicket>(NavBarActionTypes.OPEN_TICKET),
    tap(action => {
      this.notificationsService.success(`Opening ticket key ${action.payload}`);
      window.open(`${env.jiraUrl}/browse/${action.payload}`)
    })
  );

  @Effect()
  retrieveNavBar = () =>
   this.actions$.pipe(
      ofType<ActionNavBarRetrieve>(NavBarActionTypes.RETRIEVE),
      switchMap(() => {
        return this.service.retrieveNavBar().pipe(
          map((response: any) => new ActionNavBarSuccess({ navBarItems: processNavBarItems(response.data) })),
          catchError(() => of(new ActionNavBarError()))
        )
      })
    );

  @Effect()
  retrieveLinks = () =>
    this.actions$.pipe(
      ofType<ActionLinksRetrieve>(NavBarActionTypes.LINKS),
      switchMap(() => 
        this.service.getLinks().pipe(
          map((response: any) => new ActionLinksSuccess({links: processJqlLinks(response.data)})),
          catchError(() => of(new ActionLinksError()))
        )
      )
    );

  @Effect()
  getProfile = () =>
    this.actions$.pipe(
      ofType<ActionProfileRetrieve>(NavBarActionTypes.PROFILE),
      switchMap(() => {
        return this.service.getProfile().pipe(
          map((response: any) => new ActionProfileSuccess({profile: response.data})),
          catchError(() => of(new ActionProfileError()))
        )
      })
    );  
}
