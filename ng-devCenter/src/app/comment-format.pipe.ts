import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'commentFormat'
})
export class CommentFormatPipe implements PipeTransform {

	

	/*
	*/
	transform(comment:any, attachments:any,): any {

		// make an array so reference is persisted through functions (i know...)
		let stepNumber = [1];

		comment = this._formatLines(comment, attachments, stepNumber);
		comment = this._formatCode(comment);
		comment = `<div class="container"> ${comment} </div>`
		return comment;
	}

	/*
	*/
	_formatCode(comment){

		// for each code piece if inside pre-format block then add pre element
		// else just return unchanged comment piece
		// finally join all pieces back to one comment and set on current comment
		return comment.split(/{code}|{noformat}/)
		.filter(comment => comment)
		.map( (commentPiece, index) => {

			if(!commentPiece){
				return '';
			}
			
			if(index%2==1){
				// if inside code block then wrap in pre element and
				// remove all new line elements
				return `<pre class='code'>${commentPiece}</pre>`.replace(/<br>/g, '\n');
			} else {
				return commentPiece;
			}
			
		}).join('');
	}

	/*
	*/
	_formatLines(comment, attachments, stepNumber){
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
		if(/# /.test(commentPiece)){
			commentPiece = commentPiece.replace('# ', `${stepNumber[0]}. `);
			stepNumber[0]++;
		} else if(/#\* /.test(commentPiece)) {
			commentPiece = commentPiece.replace('#* ', `	- `);
		}

		// replace any headers
		else if(/^h[0-9]{1}./.test(commentPiece)) {
			let number = commentPiece[1];
			commentPiece = commentPiece.replace(`h${number}.`, `<h${number}>`);
			commentPiece += `</h${number}>`;
		}

		// replace any lines
		else if(/----/.test(commentPiece)){
			commentPiece = '<hr>';
		}

		// add any bolded comments
		const commentBolds = commentPiece.split('*');
		if(commentBolds.length > 1){
			commentPiece = commentBolds.map( (comment, index) => {
				if(index+1===commentBolds.length) return `${comment}</b>`; 
				return index%2==0 ? `${comment}<b>` : `${comment}</b>`;
			}).join('');			
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
