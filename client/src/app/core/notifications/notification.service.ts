import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';


@Injectable()
export class NotificationService {
  constructor(private toastr: ToastrService) { }

  default(message: string) {
    this.toastr.info(message);
  }

  info(message: string) {
    this.toastr.info(message);
  }

  success(message: string) {
    this.toastr.success(message);
  }

  warn(message: string) {
    this.toastr.warning(message);
  }

  error(message: string) {
    this.toastr.error(message, '', {timeOut: 10000});
  }
}
