import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from './services/config.service';

@Pipe({
	name: 'commentFormat'
})
export class CommentFormatPipe implements PipeTransform {
	config;
	constructor(config: ConfigService) {
		this.config = config;
	}

	ids = 1928378475;

	/*
	*/
	transform(comment:any, attachments:any,): any {

		// make an array so reference is persisted through functions (i know...)
		let stepNumber = 1;

		[comment, stepNumber] = this._formatLines(comment, attachments, stepNumber);
		return this._formatCode(comment);
	}

	/*
	*/
	_formatCode(comment){

		// for each code piece if inside pre-format block then add pre element
		// else just return unchanged comment piece
		// finally join all pieces back to one comment and set on current comment
		return comment.split(/{code((.|:|=|\.)*?)}|{noformat}/)
		.filter(comment => comment)
		.map( (commentPiece, index) => index%2==1 ? `<pre>${commentPiece}</pre>`.replace(/<br>/g, '\n') : commentPiece)
		.join('');
	}

	/*
	*/
	_formatLines(comment:string, attachments, stepNumber){
		let tableStart = false;

		comment = comment.split('\n').map( commentPiece => {

			[commentPiece, stepNumber] = this._format_list_headers(commentPiece, stepNumber);
			commentPiece = this._format_colors(commentPiece);
			[commentPiece, tableStart] = this._formatTable(commentPiece, tableStart);
			commentPiece = this._format_links(commentPiece);
			commentPiece = this._format_images(commentPiece, attachments);

			// return new comment line
			const newLine = tableStart ? '' : '<br>';
			return commentPiece + newLine;
		}).join('');

		return [comment, stepNumber];
	}

	/*
	*/
	_format_list_headers(commentPiece:string, stepNumber) {

		// replace any lists
		if(/# /.test(commentPiece)){
			commentPiece = commentPiece.replace('# ', `${stepNumber}. `);
			stepNumber++;
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

		return [commentPiece, stepNumber];

	}

	/*
	*/
	_formatTable(commentPiece:string, tableStart){
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
			.map(t => {
				const input = $(t).children();
				console.log('input: ', input);
				const data = $(t).text();
				console.log('data: ', data);

				return `
				<td>
					<span class='tableCopy'>
						<span class="material-icons" title="Copy to clipboard">note</span>
						<input value='${t}'>
					</span>
					${t}
				</td>`;
			})
			.join('') + '</tr>';

		} else if(tableStart) {
			tableStart = false;
			commentPiece = '<tbody></table>';
		}

		return [commentPiece, tableStart];
	}

	/*
	*/
	_format_colors(commentPiece:string){
		// replace colors
		commentPiece = commentPiece.replace(/{color:((\w+)|(#[A-Za-z0-9]{3,6}))(.*?)}/g, function(a,b) {
			return `<span style="color: ${b}">`
		});
		return commentPiece.replace(/\{color\}/g, '</span>');
	}


	/*
	*/
	_format_images(commentPiece:string, attachments){
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

	_format_links(commentPiece:string){

		// replace Jira keys with links
		commentPiece = commentPiece.replace(/[A-Z]{1,10}-(\d){2,4}/g, (a,b) => {
			return (/(\<\/a>)|http/.test(commentPiece)) ? a : `<a href="${this.config.jiraUrl}/browse/${a}" target="_blank">${a}</a>`;
		});

		// replace markdown links
		commentPiece = commentPiece.replace(/\[(.*)\|(.*)\]/, function(a,b) {
			const links = commentPiece.replace('[', '').replace(']', '').split('|');
			const link = links[1].replace(/\ .*/,'');
			return `<a href="${link}" target="_blank">${b}</a>`;
		});

		// replace general links
		commentPiece =  commentPiece.replace(/https?:\/\/(\w|.)*/, function(a,b) {
			// if already has a link then ignore
			if( commentPiece.includes('<a href') ){
				return a;
			} else {
				const pieces = a.split(/ |\]/g);

				if(pieces.length > 0){
					const piece = pieces[0].replace(/\]\|/g, '');

					// if we have more text then add it back
					let rest = ''
					if(pieces.length > 1){
						pieces.shift();
						rest = pieces.join(' ');
					}

					return `<a href="${piece}" target="_blank">${piece}</a> ${rest}`;
				} else {
					return a;
				}
			}
		});

		

		return commentPiece;
	}

}
