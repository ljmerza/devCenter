import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable()
export class CommentsService {

    constructor(private httpClient: HttpClient) {}

    /**
	 * Updates a ticket's work log. (Can add comment, log time, update merge/conflict statuses
	 * and add UCT not ready).
	 * @param {Object} postData contains properties of what actions the user wants to take.
	 * @return {Observable} the http observable
	 */
	addComment(postData): Observable<any> {
		return this.httpClient.post(`${env.apiUrl}/jira/comment`, postData);
	}

	/**
	 * edits a comment from a ticket and updates the store.
	 * @param {Comment} postData new comment skeleton object to add to ticket
	 * @return {Observable} the http observable
	 */
	editComment(postData):Observable<any>  {
		return this.httpClient.put(`${env.apiUrl}/jira/comment`, postData)
		
	}

	/**
	 * deletes a comment from a ticket and updates the store.
	 * @param {String} comment_id the id of the comment to delete
	 * @param {String} key the key of the ticket
	 * @return {Observable} the http observable
	 */
	deleteComment({commentId, key}):Observable<any> {
		let params = new HttpParams();
		params = params.append('comment_id', commentId);
		params = params.append('key', key);

		return this.httpClient.delete(`${env.apiUrl}/jira/comment`, {params});
	}


}