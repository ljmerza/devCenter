import { Component, Output, Input, ViewEncapsulation, ViewChild, EventEmitter, OnDestroy} from '@angular/core';

declare const jsPanel;
declare const $;

@Component({
  selector: 'ngx-jspanel4',
  templateUrl: 'jspanel.component.html',
  styleUrls: ['jspanel.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class JspanelComponent implements OnDestroy {
  @Input() modalSize;
  @Output() modalCloseEvent = new EventEmitter();

  @ViewChild('modalHeader') modalHeader;
  @ViewChild('modalBody') modalBody;
  @ViewChild('modalFooter') modalFooter;

  _jspanel;

  constructor() { }

  ngOnDestroy(){
    if(this._jspanel) this._jspanel.close();
  }

  openModal(options:any={}) {
    setTimeout(() => this.createNewModal(options));
  }

  createNewModal(options:any={}){
    if(this._jspanel) this._jspanel.close();
    this._jspanel = jsPanel.create( this.getJsPanelOptions(options) );
  }

  getJsPanelOptions(options){
    const jsPanelOptions = {
      headerTitle: this.modalHeader.nativeElement,
      content: this.modalBody.nativeElement,
      footerToolbar: this.modalFooter.nativeElement,
      dragit: {
          cursor:  'move',
          handles: '.jsPanel-titlebar',
          opacity: 1,
          disableOnMaximized: true
      },
      contentSize: this.getModalSize(),
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

    return jsPanelOptions;
  }

  closeModal(){
    this._jspanel.close();
  }

  getModalSize(){
    switch(this.modalSize){
      case 'xs':
        return {width: 'auto', height: 'auto'};
        break;

      case 'sm':
        return {width: 'auto', height: 'auto'};
        break;

      case 'md':
        return {width: 'auto', height: 'auto'};
        break;

      case 'lg':
        return {width: 'auto', height: 'auto'};
        break;

      case 'xl':
        return {width: 'auto', height: 'auto'};
        break;

      default:
        return {width: 'auto', height: 'auto'};
    }
  }


}
