import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ModalComponent } from '@modal';
import { CrucibleService, MiscService, ConfigService } from '@services';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';


declare const hljs:any;
declare const $:any;


@Component({
	selector: 'dc-crucible-comments',
	templateUrl: './crucible-comments.component.html',
	styleUrls: ['./crucible-comments.component.scss']
})
export class CrucibleCommentsComponent implements OnInit {

	modalRef:NgbModalRef;
	@ViewChild(ModalComponent) modal: ModalComponent;
	customModalCss:string = 'ticketComment';

	comments:Array<any> = [];
	@Input() crucibleId:string;
	comments$;
	loadingComments:boolean = true;

	constructor(private crucible:CrucibleService, private misc:MiscService, public config:ConfigService) { }

	/**
	 * get crucible comments
	 */
	ngOnInit():void {
		this.comments$ = this.crucible.getComments(this.crucibleId).subscribe(
			response => {
				this.comments = (response.data && response.data.comments) || [];
				this.loadingComments = false;
				this.setCommentActions();
			},
			this.crucible.processErrorResponse.bind(this.crucible)
		)
	}

	/**
	 * on destroy of component unsubscribe any observables.
	 */
	ngOnDestroy():void {
		if(this.comments$) this.comments$.unsubscribe();
	}

	/**
	 * add code highlighting to each comment and add copy text
	 * functionality to each table item
	 */
	setCommentActions():void {
		const misc = this.misc;
		
		setTimeout(() => {
			// highlight code needs to be triggered after modal opens
			$('pre').each(function(i, block) {
				hljs.highlightBlock(block);
			});

			// for each table item add click event for copying text
			$('.tableCopy').each(function(i, block) {
				$(this).click(function(){
					misc.copyText( $(this).children('input').get(0) );
				});
			});
		});
	}
}
