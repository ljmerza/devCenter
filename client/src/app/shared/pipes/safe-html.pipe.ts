import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safehtml'
})
export class SafehtmlPipe implements PipeTransform {
	constructor(public sanitizer: DomSanitizer){}

	transform(html) {
		return this.sanitizer.bypassSecurityTrustHtml(html);
	}

}