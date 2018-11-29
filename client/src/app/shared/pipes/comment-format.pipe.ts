import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'commentFormat'})
export class CommentFormatPipe implements PipeTransform {
	tRowSplit = "confluenceTd'>";
	tHeadSplit = "confluenceTh'>";

	constructor() {}

	/**
	 *
	 */
	transform(comment:any, attachments:any): any {
		// if false return empty string
		if(!comment) return '';

		comment = comment.replace(/confluenceTable/g, 'table mat-card comment-table');
		comment = this._formatTable(comment, this.tRowSplit);
		comment = this._formatTable(comment, this.tHeadSplit);

		// add new tab to all links
		comment = comment.replace(/href\s*=\s*(\"|\')/g, `target="_blank" href=$1`);
		return comment;
	}


	/**
	 *
	 */
	_formatTable(comment:string, tableSplitter:string){

		let commentPieces = comment.split(tableSplitter);

		if(commentPieces.length === 1) {
			return commentPieces.join(tableSplitter);
		}

		commentPieces = commentPieces.map( (piece, index) => {
			if(index === 0) return piece;

			let tableRowData = piece.split(/</);
			const copyText = tableRowData.shift();

			const nextText = copyText ? `<span>${copyText}</span>` : '';
			const newText = `
				<i class="material-icons pointer copy-input-dir copy-accent" title="Copy to clipboard">note</i>
				${nextText}
			`;

			return [newText, ...tableRowData].join('<');
		});

		return commentPieces.join(tableSplitter);
	}
}
