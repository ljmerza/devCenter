import { Component, ViewChild } from '@angular/core';
import { NgProgressComponent } from '@ngx-progressbar/core';

@Component({
  selector: 'dc-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {
	@ViewChild(NgProgressComponent) progressBar: NgProgressComponent;


  	start(){
  		// this.progressBar.start();
  	}

  	end(){
  		// this.progressBar.complete();
  	}

}
