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
				<span class='tableCopy'>
					<span class="material-icons text-success" title="Copy to clipboard">note</span>
					<input value='${copyText}'>
				</span>
				${copyText}`;

			return [newText, ...tableRowData].join('<');
		});

		return commentPieces.join(this.tableSplitter);
	}
}
