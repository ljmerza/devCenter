import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { ConfigService } from './config.service';

@Injectable()
export class MiscService {

	constructor(private sanitizer:DomSanitizer, private config:ConfigService) { }

  	/*
	*/
	copyText(text){
		text.select();
		document.execCommand("copy");
	}

	/*
	*/
	public chatUrlSanitize(username:string): SafeUrl {
		return this.sanitizer.bypassSecurityTrustUrl(`${this.config.chatUrl}/${username}`)
	}
}
