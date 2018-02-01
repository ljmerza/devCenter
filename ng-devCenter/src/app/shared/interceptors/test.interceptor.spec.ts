import { TestBed, inject } from '@angular/core/testing';

import { TestInterceptor } from './test.interceptor';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestInterceptor]
    });
  });

  it('should be created', inject([TestInterceptor], (interceptor: TestInterceptor) => {
    expect(interceptor).toBeTruthy();
  }));
});
