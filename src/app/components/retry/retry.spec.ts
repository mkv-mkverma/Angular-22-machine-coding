import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Retry } from './retry';

describe('Retry', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Retry],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create and logs the user once the request succeeds', () => {
    const fixture = TestBed.createComponent(Retry);
    httpMock.expectOne('https://dummyjson.com/useoors/1').flush({ id: 1 });

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('retries the failed request and eventually logs the error', () => {
    vi.useFakeTimers();
    try {
      TestBed.createComponent(Retry);

      for (let attempt = 0; attempt <= 7; attempt++) {
        httpMock
          .expectOne('https://dummyjson.com/useoors/1')
          .flush('fail', { status: 500, statusText: 'Server Error' });

        if (attempt < 7) {
          vi.advanceTimersByTime(2000);
        }
      }
    } finally {
      vi.useRealTimers();
    }
  });
});
