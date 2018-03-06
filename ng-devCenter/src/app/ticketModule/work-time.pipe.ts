import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'worktime'
})
export class WorkTimePipe implements PipeTransform {
	aMinute:number = 60;
	aHour:number = 60*60;
	aDay:number = 8*60*60;
	aWeek:number = 5*8*60*60;

	transform(worktime): string {
		if(!worktime || worktime == 0) return '';
		let returnText = '';

		const workWeeks = Math.floor(worktime / this.aWeek);
		worktime = workWeeks >= 1 ? worktime - this.aWeek : worktime;

		const workDays = Math.floor(worktime / this.aDay);
		worktime = workDays >= 1 ? worktime - (this.aDay*workDays) : worktime;

		const workHours = Math.floor(worktime / this.aHour);
		worktime = workHours >= 1 ? worktime - (this.aHour*workHours) : worktime;

		const workMinutes = Math.floor(worktime / this.aMinute);
		worktime = workMinutes >= 1 ? worktime - (this.aMinute*workMinutes) : worktime;

		if(workWeeks >= 1){
			const plural = workWeeks === 1 ? '' : 's';
			returnText = `${returnText} ${workWeeks} week${plural}`;
		}

		if(workDays >= 1){
			const plural = workDays === 1 ? '' : 's';
			returnText = `${returnText} ${workDays} day${plural}`;
		}

		if(workHours >= 1){
			const plural = workHours === 1 ? '' : 's';
			returnText = `${returnText} ${workHours} hour${plural}`;
		}

		if(workMinutes >= 1){
			const plural = workMinutes === 1 ? '' : 's';
			returnText = `${returnText} ${workMinutes} minute${plural}`;
		}

		return returnText;
	}
}