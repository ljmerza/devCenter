import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { ConfigService } from './config.service';

@Injectable()
export class MiscService {

	constructor(private sanitizer:DomSanitizer, private config:ConfigService) { }

  	/**
  	 * adds text to clipboard
  	 *@param {HtmlElement} inputElement input to grap text to copy from
	 */
	copyText(inputElement){
		inputElement.select();
		document.execCommand("copy");
	}

	/**
	 * creates an unsanitized chat URL
	 * @param {string} username
	 */
	public urlSanitize(username:string): SafeUrl {
		return this.sanitizer.bypassSecurityTrustUrl(`${this.config.chatUrl}/${username}`)
	}
}
