import { Component, Input, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment as env } from '@env/environment';

@Component({
  selector: 'dc-user-chat',
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UserChatComponent {
  env = env;

  constructor(private sanitizer: DomSanitizer) { }
  @Input() username:string = '';
  @Input() displayName:string = '';
  @Input() emailAddress:string = '';
  @Input() msrp:string = '';

  /**
  * generate and sanitize a chat link from a username
  */
  sanitizedChatUrl(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(`${env.chatUrl}/${this.username}`)
  }
}
