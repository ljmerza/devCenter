import { Directive, ElementRef, HostListener, ContentChild, Renderer2 } from '@angular/core';

@Directive({
	selector: '[dropdownSubmenuMenu]'
})
export class  DropdownSubmenuMenuDirective {
	constructor(public el: ElementRef) {}
}


@Directive({
	selector: '[dropdownSubmenu]'
})
export class DropdownSubmenuDirective {
	timerId;
	@ContentChild(DropdownSubmenuMenuDirective) submenuMenu: DropdownSubmenuMenuDirective;

	constructor(private render: Renderer2) { }

	/**
	*/
	@HostListener('mouseenter') onMouseEnter() {
		if(this.submenuMenu) {
			this.render.addClass(this.submenuMenu.el.nativeElement, 'show-submenu');
		}
		
	}
 
	/**
 	*/
	@HostListener('mouseleave') onMouseLeave() {
		if(this.submenuMenu) {
			this.render.removeClass(this.submenuMenu.el.nativeElement, 'show-submenu');
		}
	}
}