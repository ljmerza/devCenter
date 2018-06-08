import { Component, OnInit, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { CrucibleService, MiscService, ConfigService } from '@services';


declare const hljs:any;
declare const $:any;


@Component({
	selector: 'dc-crucible-comments',
	templateUrl: './crucible-comments.component.html',
	styleUrls: ['./crucible-comments.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class CrucibleCommentsComponent implements OnInit {

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
				this.comments = ((response.data && response.data.comments) || [])
					.map(comment => {

						// generate id for linking to comment directly
						let id = '';
						if(comment.permId && comment.permId.id){
							id = comment.permId.id;
						} else if(comment.permId){
							id = comment.permId;
						} else if(comment.permaId && comment.permaId.id){
							id = comment.permaId.id;
						} else if(comment.permaId){
							id = comment.permaId;
						}

						if(id){
							comment.id = 'c' + id.split(':')[1];
						}
						return comment;
					});
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
		});
	}
}
