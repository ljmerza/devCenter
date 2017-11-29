import { 
	Component, ViewChild, ElementRef, 
	ViewEncapsulation, Input
} from '@angular/core';

import { NgbModal, NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';

declare var hljs :any;
declare var $ :any;

@Component({
	selector: 'app-jira-comments',
	templateUrl: './jira-comments.component.html',
	styleUrls: ['./jira-comments.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class JiraCommentsComponent {
	modalReference;
	openPanelIds = [];

	@ViewChild('commentModal') content:ElementRef;
	@Input() key;
	@Input() comments;

	constructor(private modalService:NgbModal, config: NgbAccordionConfig) {}

  	/*
  	*/
	openCommentModal(): void {

		// open all panels
		this.openPanelIds = this.comments.map((c,i) => `ngb-panel-${i}`);

		// open modal
		this.modalReference = this.modalService
			.open(this.content, { windowClass: 'qa-modal' });

		// highlight code needs to be triggered after modal opens
		// so set call to initializer to back of event loop
		setTimeout( () => {
			$('pre').each(function(i, block) {
				hljs.highlightBlock(block);
			});
		},0);
	}
}
