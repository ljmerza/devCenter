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
    this.toastr.success(message, '', {timeOut: 1000000});
  }

  warn(message: string) {
    this.toastr.warning(message);
  }

  error(message: string='Unknown Error') {
    console.log({error:message}); // intentionally left here
    this.toastr && this.toastr.error(message, '', {timeOut: 10000});
  }
}
