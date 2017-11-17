import { 
	Component, ViewChild, ElementRef, 
	ViewEncapsulation
} from '@angular/core';

import { NgbModal, NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-jira-comments',
	templateUrl: './jira-comments.component.html',
	styleUrls: ['./jira-comments.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class JiraCommentsComponent {
	modalReference;
	key;
	comments;
	openPanelIds = [];

	@ViewChild('commentModal') content:ElementRef;

	constructor(private modalService:NgbModal, config: NgbAccordionConfig) {
    		config.closeOthers = false;
    		config.type = 'info';
  	}

	openCommentModal(key:string, comments): void {

		this.key = key;
		this.comments = comments;

		// open certain panels
		const commentsLength = comments.length;
		if(commentsLength > 6) {
			this.openPanelIds = [`ngb-panel-${commentsLength-1}`,`ngb-panel-${commentsLength-2}`,`ngb-panel-${commentsLength-3}`];
		} else {
			this.openPanelIds = comments.map((c,i) => `ngb-panel-${i}`);
		}

		// open modal
		this.modalReference = this.modalService
			.open(this.content, { windowClass: 'qa-modal' });
	}
}
