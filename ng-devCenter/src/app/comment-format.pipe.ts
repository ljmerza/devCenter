import { Pipe, PipeTransform } from '@angular/core';
 import { ConfigService } from './services/config.service'

@Pipe({
	name: 'commentFormat'
})
export class CommentFormatPipe implements PipeTransform {
	config;
	constructor(config: ConfigService) {
		this.config = config;
	}

	/*
	*/
	transform(comment:any, attachments:any,): any {

		// make an array so reference is persisted through functions (i know...)
		let stepNumber = [1];

		comment = this._formatLines(comment, attachments, stepNumber);
		comment = this._formatCode(comment);
		comment = `<div class="container"> ${comment} </div>`;
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
			commentPiece = this._format_links(commentPiece);

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
			commentPiece = '<table class="table table-striped table-bordered"><thead><tr>' + 
			commentPiece.split('||')
			.filter(t => !!t.trim())
			.map(t => '<th>'+t+'</th>')
			.join('') + '</tr><thead><tbody>';

		} else if(commentPiece.startsWith('|')){
			commentPiece = '<tr>' + commentPiece
			.split('|')
			.filter(t => !!t.trim())
			.map(t => '<td>'+t+'</td>')
			.join('') + '</tr>';

		} else if(tableStart) {
			tableStart = false;
			commentPiece = '<tbody></table>';
		}

		return commentPiece;
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

			if(filePath.length){
				return `<img class="rounded mx-auto d-block comment-image" src="${filePath[0].link}">`;
			} else {
				return a;
			}
			
		});
	}

	_format_links(commentPiece){

		// replace markdown links
		commentPiece = commentPiece.replace(/\[(.*)\|(.*)\]/, function(a,b) {
			const links = commentPiece.replace('[', '').replace(']', '').split('|');
			const link = links[1].replace(/\ .*/,'')
			return `<a href="${link}" target="_blank">${b}</a>`;
		});

		// replace general links
		commentPiece =  commentPiece.replace(/https?:\/\/(\w|.)*/, function(a,b) {

			if( a.includes('target="_blank"') ){
				return a;
			} else {
				const pieces = a.split(' ');

				if(pieces.length > 0){
					return `<a href="${pieces[0]}" target="_blank">${pieces[0]}</a>`
				} else {
					return a;
				}
			}
		});

		// replace Jira keys with links
		return commentPiece.replace(/[A-Z]{1,10}-(\d){1,4}/, a => {
			return `<a href="${this.config.jiraUrl}/browse/a" target="_blank">${a}</a>`
		});
	}

}
