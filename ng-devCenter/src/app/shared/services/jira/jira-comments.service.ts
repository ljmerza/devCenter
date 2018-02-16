import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ConfigService } from './../config.service';
import { ToastrService } from './../toastr.service';
import { DataService } from './../data.service';

import { NgRedux } from '@angular-redux/store';
import { RootState } from './../../store/store';
import { Actions } from './../../store/actions';

import { APIResponse } from './../../../shared/store/models/apiResponse';

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
		const resp$ = this.dataService.put(`${this.dataService.apiUrl}/jira/comment`, postData)
		resp$.subscribe(
			(response:any) => {
				response.data.key = postData.key;
				this.store.dispatch({ type: Actions.editComment, payload:response.data });
			},
			this.dataService.processErrorResponse.bind(this.dataService)
		);
		return resp$;
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

		const resp$ = this.dataService.delete(`${this.dataService.apiUrl}/jira/comment`, {params})
		resp$.subscribe(
			(response:any) => {
				this.dataService.toastr.showToast('Comment Deleted Successfully', 'success');
				this.store.dispatch({type: Actions.deleteComment, payload: {key, id:commentId}});
			},
			this.dataService.processErrorResponse.bind(this.dataService)
		);
		return resp$;
	}

	processErrorResponse(error){
		this.dataService.processErrorResponse(error);
	}

}