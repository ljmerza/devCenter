import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'commentFormat'
})
export class CommentFormatPipe implements PipeTransform {

	/*
	*/
	transform(comment:any, attachments:any, isEditing): any {

		// if not editing then format comment
		if(!isEditing){
			comment = this._formatLines(comment, attachments);
			comment = this._formatCode(comment);
			comment = `<div class="container"> ${comment} </div>`

		} else {
			comment = `<textarea class='edit-area'cols="100" value=${comment}>`;
		}

		return comment;
	}

	/*
	*/
	_formatCode(comment){

		// for each code piece if inside pre-format block then add pre element
		// else just return unchanged comment piece
		// finally join all pieces back to one comment and set on current comment
		return comment.split(/{code}|{noformat}/).map( (commentPiece, index) => {
			
			if(index%2==1){
				// if inside code block then wrap in pre element and
				// remove all new line elements
				return `<pre class='code'>${commentPiece}</pre>`.replace(/<br>/g, '');
			} else {
				return commentPiece;
			}
			
		}).join('');
	}

	/*
	*/
	_formatLines(comment, attachments){

		let stepNumber = 1;
		let tableStart = false;

		return comment.split('\n').map( commentPiece => {

			commentPiece = this._format_list_headers(commentPiece, stepNumber);
			commentPiece = this._formatTable(commentPiece, tableStart);
			commentPiece = this._format_colors(commentPiece);
			commentPiece = this._format_images(commentPiece, attachments);

			// return new comment line
			return commentPiece + '<br>';

		}).join('');
	}

	/*
	*/
	_format_list_headers(commentPiece, stepNumber) {

		// replace any lists
		if(/#* /.test(commentPiece)){
			commentPiece = commentPiece.replace('# ', `${stepNumber}. `);
			stepNumber++;
		}
		if (/#. /.test(commentPiece)) {
			commentPiece = commentPiece.replace('#* ', `	- `);
		}

		// replace any headers
		if (/^h[0-9]{1}./.test(commentPiece)) {
			let number = commentPiece[1];
			commentPiece = commentPiece.replace(`h${number}.`, `<h${number}>`);
			commentPiece += `</h${number}>`;
		}

		return commentPiece;

	}

	/*
	*/
	_formatTable(commentPiece, tableStart){
		// create tables
		if(commentPiece.startsWith('||')){
			tableStart = true;
			commentPiece = '<table class="table"><thead><tr>' + commentPiece.split('||')
			.map(t => '<th>'+t+'<th>').join('') + '</tr><thead><tbody>';

		} else if(commentPiece.startsWith('|')){
			commentPiece = '<tr>' + commentPiece.split('|').map(t => '<td>'+t+'<td>').join('') + '</tr>';

		} else if(tableStart) {
			tableStart = false;
			commentPiece = '<tbody></table>';
		}

		// replace links
		return commentPiece.replace(/\[(.*)\|(.*)\]/, function(a,b) {
			const links = commentPiece.replace('[', '').replace(']', '').split('|');
			const link = links[1].replace(/\ .*/,'')
			return `<a href="${link}" target="_blank">${b}</a>`;
		});
	}

	/*
	*/
	_format_colors(commentPiece){
		// replace colors
		commentPiece = commentPiece.replace(/{color:((\w+)|(#[A-Za-z0-9]{3,6}))(.*?)}/, function(a,b) {
			return `<span style="color: ${b}">`
		});
		return commentPiece.replace('{color}', '</span>');
	}


	/*
	*/
	_format_images(commentPiece, attachments){
		return commentPiece.replace(/!(.*?)!/, function(a,b) {
			const filenames = a.replace('!', '').split('|');
			const filePath = attachments.filter(file => file.filename === filenames[0]);
			return `<img class="rounded mx-auto d-block comment-image" src="${filePath[0].link}">`;
		});
	}

}
