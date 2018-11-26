import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'dc-loading-details',
  templateUrl: './loading-details.component.html',
  styleUrls: ['./loading-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingDetailsComponent {

  constructor() { }
  @Input() loading: boolean = false;

}
