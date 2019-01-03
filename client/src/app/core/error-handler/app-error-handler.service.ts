import {Injectable, ErrorHandler} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {environment} from '@env/environment';
import {NotificationService} from '../notifications/notification.service';
import {NotificationStyles} from '../notifications/notification-styles';

/** Application-wide error handler that adds a UI notification to the error handling
 * provided by the default Angular ErrorHandler.
 */
@Injectable()
export class AppErrorHandler extends ErrorHandler {
	constructor(private notificationsService: NotificationService) {
		super();
	}

	handleError(error: any) {
		const displayMessage = (error.error && error.error.data) || error.statusText;
		console.log({displayMessage});
		this.notificationsService.error(displayMessage);

		super.handleError(error);
	}
}
