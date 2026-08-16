import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { API_URL } from '../core/tokens/api-url.token';
import { ShortPolling } from './short-polling';

describe('ShortPolling', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortPolling],
      providers: [
        { provide: API_URL, useValue: 'https://jsonplaceholder.typicode.com' },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(ShortPolling);
      vi.advanceTimersByTime(0);
      httpMock.expectOne('https://jsonplaceholder.typicode.com/users').flush([]);

      expect(fixture.componentInstance).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('polls the API and renders users from the signal', () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(ShortPolling);
      vi.advanceTimersByTime(0);
      httpMock.expectOne('https://jsonplaceholder.typicode.com/users').flush([{ id: 1, name: 'Manish' }]);

      expect(fixture.componentInstance.users()).toEqual([{ id: 1, name: 'Manish' }]);

      fixture.detectChanges();
      const items: NodeListOf<HTMLLIElement> = fixture.nativeElement.querySelectorAll('li');
      expect(items.length).toBe(1);
      expect(items[0].textContent).toContain('Manish');
    } finally {
      vi.useRealTimers();
    }
  });

  it('exposes getUsers as a standalone method', () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(ShortPolling);
      vi.advanceTimersByTime(0);
      httpMock.expectOne('https://jsonplaceholder.typicode.com/users').flush([]);

      fixture.componentInstance.getUsers().subscribe();
      httpMock.expectOne('https://jsonplaceholder.typicode.com/users').flush([{ id: 2, name: 'Rahul' }]);
    } finally {
      vi.useRealTimers();
    }
  });
});
