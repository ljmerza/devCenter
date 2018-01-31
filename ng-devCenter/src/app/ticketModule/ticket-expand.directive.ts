import { Directive, ElementRef, HostListener, ContentChild, Renderer2 } from '@angular/core';

 declare var $:any;

@Directive({
	selector: '[dcTicketExpand]'
})
export class TicketExpandDirective {
	constructor(public el: ElementRef) {}

	@HostListener('click') onMouseEnter() {
		console.log('el: ', this.el.nativeElement);
		let $tr = $(this.el.nativeElement);
		$tr.after('<tr colspan="11"></tr>');
		console.log('$tr: ', $tr);

	}

}
