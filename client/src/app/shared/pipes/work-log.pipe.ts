import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'workLog'
})
export class WorkLogPipe implements PipeTransform {
	constructor(){}

	transform(seconds) {
		if(!seconds) return '';

		let minutes = Math.floor(seconds / 60);
		seconds = seconds % 60;

		let hours = Math.floor(minutes / 60);
		minutes = minutes % 60;

		let days = Math.floor(hours / 8);
		hours = hours % 8;

		let weeks = Math.floor(days / 5);
		days = days % 5;

		let returnValue = '';
		if(weeks) returnValue += `${weeks}w`;
		if(weeks && days) returnValue += ' ';

		if(days) returnValue += `${days}d`;
		if(days && hours) returnValue += ' ';

		if(hours) returnValue += `${hours}h`;
		if(hours && minutes) returnValue += ' ';

		if(minutes) returnValue += `${minutes}m`;
		if(minutes && seconds) returnValue += ' ';

		if(seconds) returnValue += `${seconds}s`;

		return returnValue;
	}
}