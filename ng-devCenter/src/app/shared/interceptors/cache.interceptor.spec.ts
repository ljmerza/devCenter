import { TestBed, inject } from '@angular/core/testing';

import { CacheInterceptor } from './cache.interceptor';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CacheInterceptor]
    });
  });

  it('should be created', inject([CacheInterceptor], (interceptor: CacheInterceptor) => {
    expect(interceptor).toBeTruthy();
  }));
});
