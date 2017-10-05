import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'logged'
})
export class LoggedPipe implements PipeTransform {
	transform(seconds: number): any {
		let convertedTime = '';
		let subtractedTime;
		let timeWord;

		while(seconds > 0){
			if(seconds < 60){
				convertedTime += seconds + ' seconds ';
				seconds -= seconds;

			} else if(seconds < 60*60){ // smaller than 1 hour
				subtractedTime = Math.floor(seconds/60);
				timeWord = (subtractedTime === 1) ? ' minute ' : ' minutes ';
				convertedTime += subtractedTime + timeWord;
				seconds -= subtractedTime*60;

			} else if(seconds < 60*60*8) { // smaller than one 8 hour day
				subtractedTime = Math.floor(seconds/60/60);
				timeWord = (subtractedTime === 1) ? ' hour ' : ' hours ';
				convertedTime += subtractedTime + timeWord;
				seconds -= subtractedTime*60*60;

			} else if(seconds < 60*60*8*5) { // smaller than one week with 8 hour days
				subtractedTime = Math.floor(seconds/60/60/8);
				timeWord = (subtractedTime === 1) ? ' day ' : ' days ';
				convertedTime += subtractedTime + timeWord;
				seconds -= subtractedTime*60*60*8;

			} else { 
				subtractedTime = Math.floor(seconds/60/60/8/5);
				timeWord = (subtractedTime === 1) ? ' week ' : ' weeks ';
				convertedTime += subtractedTime + timeWord;
				seconds -= subtractedTime*60*60*8*5;
			}
		}

		return convertedTime;
	}

}
