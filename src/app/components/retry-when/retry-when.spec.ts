import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { RetryWhen } from './retry-when';

describe('RetryWhen', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetryWhen],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create and log the user once the request succeeds', () => {
    const fixture = TestBed.createComponent(RetryWhen);
    httpMock.expectOne('https://dummyjson.com/users/1').flush({ id: 1 });

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('stops immediately and logs the error on a 404', () => {
    TestBed.createComponent(RetryWhen);
    httpMock
      .expectOne('https://dummyjson.com/users/1')
      .flush('not found', { status: 404, statusText: 'Not Found' });
  });

  it('waits and retries non-404 errors until the retry count is exhausted', () => {
    vi.useFakeTimers();
    try {
      TestBed.createComponent(RetryWhen);

      for (let attempt = 0; attempt <= 3; attempt++) {
        httpMock
          .expectOne('https://dummyjson.com/users/1')
          .flush('fail', { status: 500, statusText: 'Server Error' });

        if (attempt < 3) {
          vi.advanceTimersByTime(1000);
        }
      }
    } finally {
      vi.useRealTimers();
    }
  });
});
