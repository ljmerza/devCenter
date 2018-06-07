import { Component, ViewChild, ViewEncapsulation, Input, ChangeDetectionStrategy} from '@angular/core';
import { ModalComponent } from '@modal';

@Component({
	selector: 'crucible-comments-modal',
	templateUrl: './crucible-comments-modal.component.html',
	styleUrls: ['./crucible-comments-modal.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrucibleCommentsModalComponent {
	modalSize = '1000px 700px';
	@ViewChild(ModalComponent) modal: ModalComponent;
	@Input() crucibleId;

	constructor() {}

  	/**
	 *
	 */
	openModal(): void {
		this.modal.openModal();
	}
}
