import { 
	Component, Output, Input, ViewEncapsulation,
	EventEmitter, ViewChild, ChangeDetectionStrategy 
} from '@angular/core';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'dev-center-modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ModalComponent {
	@Input() title;
	@Input() size;
	@Input() customClose:boolean = false;
	@Output() modalEvent = new EventEmitter();
	@ViewChild('modal') modal: NgbModal;
	modalRef;

	constructor(private modalService: NgbModal) { }


	/**
	*/
	openModal(){
		// create custom args
		let options:any = {};
		if(this.size) options.size = this.size;

		// open modal and return modal ref
		this.modalRef = this.modalService.open(this.modal, options);
		return this.modalRef;
	}

	/**
	*/
	closeModal(closeMessage){
		this.modalRef.close();
		this.modalEvent.emit(closeMessage);
	}
}
