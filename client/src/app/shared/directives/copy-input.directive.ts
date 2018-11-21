import { Directive, ElementRef, HostListener } from '@angular/core';

declare var $;

@Directive({
  selector: '[dcCopyInput]'
})
export class CopyInputDirective {

  constructor(public el: ElementRef) { }

  @HostListener('click') 
  onClick() {
    const inputToCopy = $(this.el.nativeElement).next().text() || '';
    const selBox = document.createElement('textarea');

    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = inputToCopy.trim();

    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');

    document.body.removeChild(selBox);
  }
}