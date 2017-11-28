import { 
	Component, ViewChild, ElementRef, 
	ViewEncapsulation, Input, AfterViewInit
} from '@angular/core';

import { NgbModal, NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';

declare var hljs :any;

@Component({
	selector: 'app-jira-comments',
	templateUrl: './jira-comments.component.html',
	styleUrls: ['./jira-comments.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class JiraCommentsComponent implements AfterViewInit {
	modalReference;
	openPanelIds = [];

	@ViewChild('commentModal') content:ElementRef;
	@Input() key;
	@Input() comments;

	constructor(private modalService:NgbModal, config: NgbAccordionConfig) {
    		config.closeOthers = false;
    		config.type = 'info';
  	}

  	ngAfterViewInit(){
  		console.log('hljs: ', hljs);
  		// hljs.initHighlightingOnLoad();
  	}

	openCommentModal(): void {

		// open certain panels
		const commentsLength = this.comments.length;
		if(commentsLength > 6) {
			this.openPanelIds = [`ngb-panel-${commentsLength-1}`,`ngb-panel-${commentsLength-2}`,`ngb-panel-${commentsLength-3}`];
		} else {
			this.openPanelIds = this.comments.map((c,i) => `ngb-panel-${i}`);
		}

		// open modal
		this.modalReference = this.modalService
			.open(this.content, { windowClass: 'qa-modal' });
	}
}
