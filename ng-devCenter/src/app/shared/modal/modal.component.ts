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
	@Input() modalSize;
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
		this._jspanel = jsPanel.create( this.getJsPanelOptions(options) );
	}

	/**
	 * sets the JjPanel options object
	 * @param {Object} options
	 * @return {Object} 
	 */
	private getJsPanelOptions(options){
		let jsPanelOptions = {
			headerTitle: this.modalHeader.nativeElement,
			content: this.modalBody.nativeElement,
			footerToolbar: this.modalFooter.nativeElement,
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
		}

		if(this.modalSize && this.modalSize.width) jsPanelOptions.contentSize = this.modalSize;
		else if(this.modalSize) jsPanelOptions.contentSize = this.getSize();
		else jsPanelOptions.contentSize = {width: 'auto', height: 'auto'};

		return jsPanelOptions;
	}

	/**
	 * calculates modal size dimensions
	 * @return {Object} with width and height properties
	 */
	private getSize(){
		const [width, height] = this.modalSize.split(' ');
		return {width, height};
	}

	/**
	 * closes jsPanel dialog
	 */
	closeModal(){
		this._jspanel.close();
	}

}
