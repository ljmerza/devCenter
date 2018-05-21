import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MomentModule } from 'angular2-moment';
import { SharedModule } from '../shared/shared.module';


import { TicketCommentsModalComponent } from './ticket-comments-modal/ticket-comments-modal.component';
import { CrucibleCommentsModalComponent } from './crucible-comments-modal/crucible-comments-modal.component';
import { TicketCommentsComponent } from './ticket-comments/ticket-comments.component';
import { CrucibleCommentsComponent } from './crucible-comments/crucible-comments.component';


import { SafehtmlPipe } from './safehtml.pipe';
import { CommentFormatPipe } from './comment-format.pipe';

@NgModule({
	imports: [CommonModule, NgbModule, MomentModule, SharedModule],
	declarations: [
		TicketCommentsComponent, TicketCommentsModalComponent, CrucibleCommentsModalComponent,
		SafehtmlPipe, CommentFormatPipe, CrucibleCommentsComponent
	],
	exports: [TicketCommentsComponent, TicketCommentsModalComponent]
})
export class CommentsModule {}