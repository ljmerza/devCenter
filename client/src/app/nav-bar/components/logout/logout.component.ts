import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';

import {ActionSettingsPersist} from '@app/settings/settings.actions';
import {initialState} from '@app/settings/settings.reducer';
import {NotificationService} from '@app/core/notifications/notification.service';
import {PanelComponent} from '@app/panel/components/panel/panel.component';

@Component({
	selector: 'dc-logout',
	templateUrl: './logout.component.html',
	styleUrls: ['./logout.component.css'],
})
export class LogoutComponent {
	@ViewChild(PanelComponent) modal: PanelComponent;

	constructor(public store: Store<{}>, private router: Router, private notificationsService: NotificationService) {}

	confirmLogout(): void {
		this.modal.closeModal();
		this.notificationsService.info('Erasing settings and logging out');

		this.store.dispatch(new ActionSettingsPersist({...initialState}));
		this.router.navigate(['/settings']);
	}
}
