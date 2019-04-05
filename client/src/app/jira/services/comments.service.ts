import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment as env} from '@env/environment';
import {Observable} from 'rxjs';

@Injectable()
export class CommentsService {
	constructor(private httpClient: HttpClient) {}

	/**
	 * Updates a ticket's work log. (Can add comment, log time, update merge/conflict statuses
	 * and add UAT not ready).
	 * @param {Object} postData contains properties of what actions the user wants to take.
	 * @return {Observable} the http observable
	 */
	addComment(postData): Observable<any> {
		return this.httpClient.post(`${env.apiUrl}/jira/comment`, postData);
	}

	/**
	 * edits a comment from a ticket and updates the store.
	 * @param {string} comment the new comment
	 * @param {string} commentId the id of the comment to edit
	 * @param {string} key the key of the ticket
	 * @param {boolean} privateComment is comment dev only or public
	 * @return {Observable} the http observable
	 */
	editComment({comment, commentId, key, privateComment}): Observable<any> {
		const postBody = {comment, comment_id: commentId, key, private_comment: privateComment};
		return this.httpClient.put(`${env.apiUrl}/jira/comment`, postBody);
	}

	/**
	 * deletes a comment from a ticket and updates the store.
	 * @param {String} commentId the id of the comment to delete
	 * @param {String} key the key of the ticket
	 * @return {Observable} the http observable
	 */
	deleteComment({commentId, key}): Observable<any> {
		let params = new HttpParams();
		params = params.append('comment_id', commentId);
		params = params.append('key', key);

		return this.httpClient.delete(`${env.apiUrl}/jira/comment`, {params});
	}
}
