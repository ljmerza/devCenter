import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';


import { ActionTicketsRetrieve } from '../../jira.actions';
import { selectJiraState } from '../../jira.selectors';

@Component({
  selector: 'dc-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

  constructor(private route: ActivatedRoute, public store: Store<{}>) { }
  currentJql:string = '';

  tickets$;
  tickets:Array<any> = [];
  loading:boolean = false;

  ngOnInit():void {

    this.tickets$ = this.store.pipe(select(selectJiraState))
      .subscribe(state => {
        console.log(state)
        this.tickets = state.tickets;
        this.loading = state.loading;
      });


		this.route.paramMap.subscribe((routeResponse:any) => {
      this.currentJql = routeResponse.params.jql;
      this.store.dispatch(new ActionTicketsRetrieve({ current_jql:this.currentJql, fields: '' }));
		});
	}

}
