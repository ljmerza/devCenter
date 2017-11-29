import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'commentFormat'
})
export class CommentFormatPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
