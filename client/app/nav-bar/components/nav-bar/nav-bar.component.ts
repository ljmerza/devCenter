import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { selectNavBarItems,  } from '../../nav-bar.selectors';
import { ActionNavBarRetrieve } from '../../nav-bar.actions';
import { NavBarState } from '../../nav-bar.state';

@Component({
  selector: 'dc-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit, OnDestroy {
  private subscribe$: Subscription;
  navBarItems;
  logo = require('@app/../assets/logo.png');

  constructor(public store: Store<NavBarState>) { }

  ngOnInit() {
  	this.subscribe$ = this.store.pipe(select(selectNavBarItems)).subscribe((navBarItems:any) => {
      this.navBarItems = navBarItems;
    });
  	
		this.store.dispatch(new ActionNavBarRetrieve());
  }

  ngOnDestroy(): void {
    this.subscribe$.unsubscribe();
  }
}
