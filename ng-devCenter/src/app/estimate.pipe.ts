import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estimate'
})
export class EstimatePipe implements PipeTransform {

  transform(storyPoints: number): any {

  	if(storyPoints < 1){
  		return (storyPoints * 24) + ' Hours';

  	} else if(storyPoints < 5){
  		if(storyPoints == 1) {
  			return storyPoints + ' Day';
  		} else {
			return storyPoints + ' Days';
  		}
  	
  	} else {
  		let value = (storyPoints/5).toString() + ' Weeks';

  		if(storyPoints/5 > 1){
  			value += (storyPoints%5).toString() + ' Days';
  		}
		
		return value;
  	}
  }

}
