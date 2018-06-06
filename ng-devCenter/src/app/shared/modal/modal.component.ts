import { 
	Component, Output, Input, ViewEncapsulation, ContentChild, ViewChild, ViewChildren,
	EventEmitter, ChangeDetectionStrategy, Inject, ContentChildren, ElementRef, ChangeDetectorRef
} from '@angular/core';

import { NgbModal, NgbModalRef, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


declare var jsPanel;
@Component({
	selector: 'dev-center-modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ModalComponent {
	@Input() modalSize = '';
	@Output() modalEvent = new EventEmitter();

	@ViewChild('modalHeader') modalHeader;
	@ContentChild('modalBody') modalBody: ElementRef;

	modalRef;
	_jspanelRef;

	constructor(private cd: ChangeDetectorRef) { }

	/**
	*/
	openModal(options?:any={}) {
		this.cd.detectChanges();

		this.modalRef = jsPanel.create({
			headerTitle: this.modalHeader.nativeElement.innerHTML
		});

		// create custom args
		// if(this.modalSize){
		// 	options = {...options, ...{windowClass: this.modalSize}};
		// }		

		// open modal and return modal ref
		// this.modalRef = this.modalService.open(this.modal, options);
		return this.modalRef;
	}

	/**
	*/
	closeModal(closeMessage:any){
		this.modalRef.close();
		this.modalEvent.emit(closeMessage);
	}
}
