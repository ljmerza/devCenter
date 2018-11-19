import { Component, OnDestroy, Input, Output, ViewChild, ViewEncapsulation, EventEmitter } from '@angular/core';

declare const jsPanel;

@Component({
  selector: 'dc-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PanelComponent implements OnDestroy {

  @Input() modalSize;
  @Output() modalCloseEvent = new EventEmitter();

  @ViewChild('modalHeader') modalHeader;
  @ViewChild('modalBody') modalBody;
  @ViewChild('modalFooter') modalFooter;

  _jspanel;
  constructor() { }

	/**
	 * destroy any open js panels
	 */
  ngOnDestroy():void {
    if (this._jspanel) this._jspanel.close();
  }

	/**
	 * opens a new jsPanel dialog
	 */
  openModal(options: any = {}):void {
    setTimeout(() => this.createNewModal(options));
  }

	/**
	 * closes the existing jsPanel and creates a new one
	 * @param {Object?} options passed to jsPanel create method (overwrites default settings)
	 */
  createNewModal(options: any = {}):void {
    if (this._jspanel) this._jspanel.close();
    this._jspanel = jsPanel.create(this.getJsPanelOptions(options));
  }

	/**
	 * sets the JjPanel options object
	 * @param {Object} options
	 * @return {Object} 
	 */
  getJsPanelOptions(options):Object {
    return {
      headerTitle: this.modalHeader.nativeElement,
      content: this.modalBody.nativeElement,
      footerToolbar: this.modalFooter.nativeElement,
      container: '.mat-drawer-container',
      minimizeTo: 'parent',
      dragit: {
        cursor: 'move',
        handles: '.jsPanel-titlebar',
        opacity: 1,
        disableOnMaximized: true
      },
      contentSize: this.getModalSize(),
      maximizedMargin: [150, 5, 5, 5],
      callback: () => {
        // hack to get when we close from header
        setTimeout(() => {
          this._jspanel.controlbar.querySelector('.jsPanel-btn-close').addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.modalCloseEvent.emit();
          });
        });
      },
      ...options
    }
  }

  /**
   * 
   */
  getModalSize(){
    switch (this.modalSize){
      case 'xs':
        return { width: 'auto', height: 'auto' };
      case 'sm':
        return { width: 'auto', height: 'auto' };
      case 'md':
        return { width: 'auto', height: 'auto' };
      case 'lg':
        return { width: 'auto', height: 'auto' };
      case 'xl':
        return { width: 'auto', height: 'auto' };
      default:
        return { width: 'auto', height: 'auto' };
    }
  }

	/**
	 * closes jsPanel dialog
	 */
  closeModal():void {
    this._jspanel.close();
  }

}
