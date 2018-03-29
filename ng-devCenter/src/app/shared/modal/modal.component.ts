import { 
	Component, Output, Input, ViewEncapsulation, ChangeDetectorRef,
	EventEmitter, ViewChild, ChangeDetectionStrategy, ElementRef, Renderer2 
} from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'dev-center-modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ModalComponent {
	@Input() modalSize:string;
	@ViewChild("modal", {read: ElementRef}) tref: ElementRef;
	@Output() modalEvent = new EventEmitter();
	modelIsHidden = true;

	modalLeft;
	modalTop;

	constructor(private cd: ChangeDetectorRef, private el: ElementRef, private render: Renderer2) { }

	/**
	*/
	openModal() {
		this.modelIsHidden = false;
		this.cd.detectChanges();
	}

	/**
	*/
	closeModal(){
		this.modelIsHidden = true;
		this.cd.detectChanges();
	}

	dragEnd({x,y}){
		const left = this.el.nativeElement.offsetLeft;
		console.log(this.tref.nativeElement)
		console.log(x,y,left, this.tref, `transform: translate(${x}px, ${y}px);`);
		this.tref.nativeElement.setAttribute("style", `transform: translate(${x}px, ${y}px);`);
		// this.tref.nativeElement.setAttribute("style", `top: ${y}px;`);
	}
}
