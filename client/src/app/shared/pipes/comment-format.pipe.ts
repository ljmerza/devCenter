import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'commentFormat'})
export class CommentFormatPipe implements PipeTransform {
	constructor() {}

	/*
	*/
	transform(comment:any, attachments:any,): any {
		// if false return empty string
		if(!comment) return '';

		comment = comment.replace(/confluenceTable/g, 'table');
		comment = this._formatTable(comment);

		// add new tab to all links
		comment = comment.replace(/href\s*=\s*(\"|\')/g, `target="_blank" href=$1`);
		return comment;
	}


	/*
	*/
	tableSplitter = "confluenceTd'>";
	_formatTable(comment:string){

		let commentPieces = comment.split(this.tableSplitter);

		if(commentPieces.length === 1) {
			return commentPieces.join(this.tableSplitter);
		}

		commentPieces = commentPieces.map( (piece, index) => {
			if(index === 0) return piece;

			let tableRowData = piece.split(/</);
			const copyText = tableRowData.shift();

			const newText = `
				<i class="material-icons pointer copy-jira" title="Copy Jira link to clipboard">note</i>
				<span>${copyText}</span>
			`;

			return [newText, ...tableRowData].join('<');
		});

		return commentPieces.join(this.tableSplitter);
	}
}
