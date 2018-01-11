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

	constructor(private render: Renderer2) { 
		this.timerId = setTimeout(() => {});
	}

	/**
	*/
	@HostListener('mouseenter') onMouseEnter() {
		if(this.submenuMenu) {
			if(this.timerId) window.clearTimeout(this.timerId);
			this.timerId = setTimeout(() => {
				this.render.addClass(this.submenuMenu.el.nativeElement, 'show-submenu');
			}, 0);
		}
		
	}
 
	/**
 	*/
	@HostListener('mouseleave') onMouseLeave() {
		if(this.submenuMenu) {
			if(this.timerId) window.clearTimeout(this.timerId);
			this.timerId = setTimeout(() => {
				this.render.removeClass(this.submenuMenu.el.nativeElement, 'show-submenu');
			}, 0);
		}
	}
}