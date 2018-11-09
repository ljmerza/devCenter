import { Injectable } from '@angular/core';
import { LocalStorageService } from '@app/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { environment as env } from '@env/environment';

import { NotificationService } from '@app/core/notifications/notification.service';

import {
  ActionNavBarRetrieve,
  ActionNavBarRetrieveSuccess, NavBarActionTypes,
  ActionSearch, ActionSearchSuccess, 
  ActionOpenTicket, ActionProfileRetrieve, ActionProfileSuccess
} from './nav-bar.actions';

import { NavBarService } from './nav-bar.service';
import { NavBarItem } from './nav-bar.model';

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
      switchMap((action: ActionNavBarRetrieve) => 
        this.service.retrieveNavBar().pipe(
          map((response: any) => new ActionNavBarRetrieveSuccess({navBarItems: this.processNavBarItems(response.data)})),
        )
      )
    );

  @Effect()
  getProfile = () =>
    this.actions$.pipe(
      ofType<ActionProfileRetrieve>(NavBarActionTypes.PROFILE),
      switchMap((action: ActionProfileRetrieve) => {
        console.log({action});
        return this.service.getProfile().pipe(
          map((response: any) => new ActionProfileSuccess({profile: response.data})),
        )
      })
    );

  /**
   *
   */
  private processNavBarItems(navBarItems): NavBarItem[] {
    let fullNavbar = this.splitNavbarItems(navBarItems);
    const navItems = this.converNavbarToObject(fullNavbar);
    return navItems;
  }

  /**
   *
   */
  private splitNavbarItems(navBarItems = []) {
    let fullNavbar: any = [];

    navBarItems.forEach(item => {
      const linkPosition = item.type.split('/');
      let navDropdown: any;

      linkPosition.forEach((linkName, index) => {
        const childItems = index ? navDropdown.items : fullNavbar;
        navDropdown = this.getChildNavMenu(childItems, linkName, item.type);

        if (index == linkPosition.length - 1) {
          navDropdown.items = this.processNavBarItem(
            navDropdown.items,
            item,
            linkName
          );
        }
      });
    });

    return fullNavbar;
  }

  /**
   *
   */
  private converNavbarToObject(fullNavbar) {
    return fullNavbar.reduce((acc, curr) => {
      if (!acc[curr.name]) {
        const propName = curr.name.replace(/\s/g, '');
        acc[propName] = curr;
      }
      return acc;
    }, {});
  }

  /**
   * find a child navmenu - if does't exist then create one and add it
   * @param {Object} parentNavMenu the parent navmenu we want to find a child of
   * @param {string} name the name of the navmenu we are trying to locate
   * @param {string} itemType the type of the navbar item
   * @return {Object}
   */
  private getChildNavMenu(parentNavMenu, name, itemType) {
    const childNavMenu = parentNavMenu.find(nav => nav.name === name);
    let navBarItem;

    if (!childNavMenu) {
      navBarItem = { name, items: [] };
      parentNavMenu.unshift(navBarItem);
    } else {
      navBarItem = childNavMenu;
    }

    return navBarItem;
  }

  /**
   *
   */
  private processNavBarItem(fullNavbar, item, category) {
    let navBarItem: any = {
      link: item.link,
      name: item.name,
      hasFullUrl: /^http/.test(item.link),
      isEmber: /\/Ember\//i.test(item.type),
      isTeam: /TeamDB/i.test(item.type) || /TeamDB/i.test(item.name)
    };

    if (/Ember/i.test(item.name)) {
      navBarItem = this.addParam(navBarItem, 'cache');
    }

    if (/GPS/i.test(item.name)) {
      navBarItem = this.addParam(navBarItem, 'gpsid');
    }

    fullNavbar.push(navBarItem);
    return fullNavbar;
  }

  /**
   * adds a parameter name to a URL
   * @param {Object} navbarItem
   * @param {string} paramName
   */
  private addParam(navbarItem, paramName) {
    const queryAddition = navbarItem.link.includes('?') ? '&' : '?';
    navbarItem.link += `${queryAddition}${paramName}=`;
    return navbarItem;
  }
}
