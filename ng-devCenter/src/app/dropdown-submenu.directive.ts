import { Directive, ElementRef, HostListener } from '@angular/core';

declare var $ :any;

@Directive({
	selector: '[dropdownSubmenu]'
})
export class DropdownSubmenuDirective {
	timerId;

	constructor(private el: ElementRef) { 
		this.timerId = setTimeout(() => {});
	}

	@HostListener('mouseenter') onMouseEnter() {
		let $submenu = $(this.el.nativeElement);
		let $submenuItems = $submenu.children('.dropdown-submenu-items');

		if(this.timerId) window.clearTimeout(this.timerId);
		this.timerId = setTimeout(() => {
			$submenuItems.addClass('show-submenu');
		}, 0);
	}
 
	@HostListener('mouseleave') onMouseLeave() {
		let $submenu = $(this.el.nativeElement);
		let $submenuItems = $submenu.children('.dropdown-submenu-items');

		if(this.timerId) window.clearTimeout(this.timerId);
		this.timerId = setTimeout(() => {
			$submenuItems.removeClass('show-submenu');
		}, 200);
	}
}
