import { Component, Output, Input, ViewEncapsulation, ViewChild, EventEmitter, ChangeDetectionStrategy} from '@angular/core';

declare const jsPanel;
declare const $;

@Component({
	selector: 'dev-center-modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ModalComponent {
	@Input() modalSize = '600px 150px';
	@Output() modalCloseEvent = new EventEmitter();

	@ViewChild('modalHeader') modalHeader;
	@ViewChild('modalBody') modalBody;
	@ViewChild('modalFooter') modalFooter;

	_jspanel;
	constructor() { }

	/**
	 * opens a new jsPanel dialog
	 */
	openModal(options:any={}) {
		setTimeout(() => this.createNewModal(options));
	}

	/**
	 * closes the existing jsPanel and creates a new one
	 * @param {Object?} options passed to jsPanel create method (overwrites default settings)
	 */
	createNewModal(options:any={}){
		if(this._jspanel) this._jspanel.close();
		
		this._jspanel = jsPanel.create({
			headerTitle: this.modalHeader.nativeElement,
			content: this.modalBody.nativeElement,
			footerToolbar: this.modalFooter.nativeElement,
			contentSize: this.getSize(),
			dragit: {
			    cursor:  'move',
			    handles: '.jsPanel-titlebar',
			    opacity: 1,
			    disableOnMaximized: true
			},
			maximizedMargin: [150, 5, 5, 5],
			callback: () =>  {
				setTimeout(() => {
					this._jspanel.controlbar.querySelector('.jsPanel-btn-close').addEventListener('mouseup', (e) => {
						e.preventDefault();
						this.modalCloseEvent.emit();
					});
				});
		    },
			...options
		});
	}

	/**
	 * calculates modal size dimensions
	 * @return {Object} with width and height properties
	 */
	private getSize(){
		const [width, height] = this.modalSize.split(' ');
		console.log('width, height: ', width, height);
		return {width, height};
	}

	/**
	 * closes jsPanel dialog
	 */
	closeModal(){
		this._jspanel.close();
	}

}
