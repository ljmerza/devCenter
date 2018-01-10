import { TestBed, inject } from '@angular/core/testing';

import { LoggerInterceptor } from './logger.interceptor';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggerInterceptor]
    });
  });

  it('should be created', inject([LoggerInterceptor], (interceptor: LoggerInterceptor) => {
    expect(interceptor).toBeTruthy();
  }));
});
