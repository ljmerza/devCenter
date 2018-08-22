import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'dc-jql-links',
	templateUrl: './jql-links.component.html',
	styleUrls: ['./jql-links.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JqlLinksComponent {
	@Input() jqlNavbar;
}
