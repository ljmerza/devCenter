import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NgRedux } from '@angular-redux/store';

import { ConfigService } from './../config.service';
import { ToastrService } from './../toastr.service';
import { DataService } from './../data.service';

import { RootState, Actions } from '@store';
import { APIResponse } from '@models';

@Injectable()
export class JiraCommentsService {

	constructor(public dataService:DataService, private store:NgRedux<RootState>) {}

	/**
	 * Updates a ticket's work log. (Can add comment, log time, update merge/conflict statuses
	 * and add UCT not ready).
	 * @param {Object} postData contains properties of what actions the user wants to take.
	 * @return {Observable} the http observable
	 */
	workLog(postData): Observable<any> {
		return this.dataService.post(`${this.dataService.apiUrl}/jira/comment`, postData);
	}

	/**
	 * edits a comment from a ticket and updates the store.
	 * @param {Comment} postData new comment skeleton object to add to ticket
	 * @return {Observable} the http observable
	 */
	editComment(postData):Observable<any>  {
		return this.dataService.put(`${this.dataService.apiUrl}/jira/comment`, postData)
		
	}

	/**
	 * deletes a comment from a ticket and updates the store.
	 * @param {String} comment_id the id of the comment to delete
	 * @param {String} key the key of the ticket
	 * @return {Observable} the http observable
	 */
	deleteComment(commentId, key):Observable<any> {
		let params = new HttpParams();
		params = params.append('comment_id', commentId);
		params = params.append('key', key);

		return this.dataService.delete(`${this.dataService.apiUrl}/jira/comment`, {params});
	}

	processErrorResponse(error){
		this.dataService.processErrorResponse(error);
	}

}