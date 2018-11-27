import { Directive, ElementRef, HostListener } from '@angular/core';

declare var $;

@Directive({
  selector: '[dcCopyInputBubble]'
})
export class CopyInputsDirective {

  constructor(public el: ElementRef) { }

  @HostListener('click', ['$event']) 
  onClick(event) {
  	// get the target element that was click
  	// make maek sure it's a copy input dir element
  	let $target = $(event.target);
  	if(!$target.hasClass('copy-input-dir')) return;

    $target = $target.next();
    let inputToCopy = $target.text() || '';

    // if nothing still then exit so we dont overwrite the current clipboard
    if(!inputToCopy) return;

    // if a link then grab href instead
    if($target[0] && $target[0].nodeName === 'A'){
    	inputToCopy = $target[0].href || '';
    }

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