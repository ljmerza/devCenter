import { 
	Component, ViewChild, ElementRef, 
	ViewEncapsulation, Input, OnInit
} from '@angular/core';

import { NgbModal, NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';
import { JiraService } from './../services/jira.service';

declare var hljs :any;
declare var $ :any;

@Component({
	selector: 'app-jira-comments',
	templateUrl: './jira-comments.component.html',
	styleUrls: ['./jira-comments.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class JiraCommentsComponent implements OnInit {
	modalReference;
	openPanelIds = [];

	@ViewChild('commentModal') content:ElementRef;
	@Input() key;
	@Input() comments;
	@Input() attachments;

	constructor(private modalService:NgbModal, config: NgbAccordionConfig, public jira:JiraService) {}

	ngOnInit() {

		// add isEditing boolean to each comments
		this.comments = this.comments.map(comment => {
			comment.isEditing = false;
			comment.closeText = 'Edit Comment';
			return comment;
		});
	}

  	/*
  	*/
	openCommentModal(): void {

		// open all panels if less than 6 else open last three
		this.openPanelIds = this.comments.map((c,i) => {
			if(this.comments.length<6 || (this.comments.length>6 && i>this.comments.length-4)){
				return `${this.key}${i}`;
			}
		});

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

	/*
	*/
	toggleEditing(comment){
		comment.isEditing = !comment.isEditing;
		comment.closeText = comment.closeText == 'Cancel Editing' ? 'Edit Comment' : 'Cancel Editing';
	}
}
