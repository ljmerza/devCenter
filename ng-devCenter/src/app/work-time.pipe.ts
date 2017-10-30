import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'worktime'
})
export class WorkTimePipe implements PipeTransform {
	transform(worktime): string {

		if(!worktime || worktime == 0) return '';

		let day:string = '';

		return worktime.split(' ').map( time => {

			switch( time.substr(-1) ){

				case 'w':
					day = ' week';
					break;

				case 'd':
					day = ' day';
					break;

				case 'h':
					day = ' hour';
					break;

				case 'm':
					day = ' minute';
					break;

				case 's':
					day = ' second';
					break;
			}

			if(time[0] !== '1') day += 's';

			return time.substring(0, time.length - 1) + day;	
		}).join(' ')
	}

}
