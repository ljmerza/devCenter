import { Directive, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { MiscService } from '@services';

@Directive({
	selector: '[dcCopyText]'
})
export class CopyTextDirective {


	constructor(private render: Renderer2, private el: ElementRef, private misc: MiscService) { }

	/**
	 * Copy contents of child input element 
	 */
	@HostListener('click') 
	onMouseEnter() {
		let $inputElement = $(this.el.nativeElement).children('input').get(0)
		this.misc.copyText($inputElement);
	}
 
}
