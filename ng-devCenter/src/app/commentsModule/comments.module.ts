import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MomentModule } from 'angular2-moment';
import { SharedModule } from '../shared/shared.module';


import { TicketCommentsModalComponent } from './ticket-comments-modal/ticket-comments-modal.component';
import { TicketCommentsComponent } from './ticket-comments/ticket-comments.component';

import { SafehtmlPipe } from './safehtml.pipe';
import { CommentFormatPipe } from './comment-format.pipe';

@NgModule({
	imports: [CommonModule, NgbModule.forRoot(), MomentModule, SharedModule.forRoot()],
	declarations: [
		TicketCommentsComponent, TicketCommentsModalComponent,
		SafehtmlPipe, CommentFormatPipe,
	],
	exports: [TicketCommentsComponent, TicketCommentsModalComponent]
})
export class CommentsModule {}