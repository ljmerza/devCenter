import { Directive, Input, HostListener, HostBinding, OnInit } from '@angular/core';

class Position {
	x: number; y: number;
	constructor (x, y) { this.x = x; this.y = y; }
 };

@Directive({
	selector: '[dcDraggable]'
})
export class DraggableDirective {
	private moving = false;
	private origin = null;

	constructor( ) {}

	@Input('handle') handle: HTMLElement; 

	@HostBinding('style.transform') transform: string = 'translate3d(0,0,0)'; 

	@HostListener('mousemove', ['$event']) 
	mousemove($event:MouseEvent) {
		if(this.moving){
			$event.preventDefault();
			this.moveTo($event.clientX, $event.clientY);
		}
	}

	 @HostListener('mouseup', ['$event']) mouseup() { 
		  this.moving = false;
	}

	@HostListener('mousedown', ['$event'])
	onMouseDown($event:MouseEvent) {
		if ($event.button == 2 || (this.handle !== undefined && $event.target !== this.handle)) {
		  	return;	// if handle was provided and not clicked, ignore
		} else {
			 this.moving = true;
			 this.origin = this.getPosition($event.clientX, $event.clientY);
		}
	}

	private getPosition(x:number, y:number): Position {
		let transVal:string[] = this.transform.split(',');
		let newX = parseInt(transVal[0].replace('translate3d(',''));
		let newY = parseInt(transVal[1]);
		return new Position(x-newX, y-newY);
	}

	private moveTo(x:number, y:number): void {
		if (this.origin) {
		  	this.transform = this.getTranslate(x-this.origin.x, y-this.origin.y);
		}
	}

	private getTranslate(x:number,y:number): string{
		return `translate3d(${x}px, ${y}px, 0px)`;
	}
 }
