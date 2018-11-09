import { Component, OnInit } from '@angular/core';
import { environment as env } from '@env/environment';
import { NotificationService } from '@app/core/notifications/notification.service';

@Component({
  selector: 'dc-log-time',
  templateUrl: './log-time.component.html',
  styleUrls: ['./log-time.component.css']
})
export class LogTimeComponent implements OnInit {
	showLogHours = false;
	env = env
	constructor(private notificationsService: NotificationService) {}

	ngOnInit(){
		this.setFridayChecker();
	}

	private isFriday = () => (new Date()).getDay() == 5;


	/**
	 * checks if it's Friday every minute to show log hours
	 */
	private setFridayChecker(){
		this.showLogHours = this.isFriday();
		
		setInterval(() => {
			const itIsFriday = this.isFriday();

			// if we need to toggle the view then do that now
			if((itIsFriday && !this.showLogHours) || (!itIsFriday && this.showLogHours)) {
				this.showLogHours = itIsFriday;
			}
		}, 60*1000);
	}
}