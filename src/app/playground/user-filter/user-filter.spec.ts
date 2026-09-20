import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { UserFilter } from './user-filter';

describe('UserFilter', () => {
  let component: UserFilter;
  let fixture: ComponentFixture<UserFilter>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFilter],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFilter);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requests users with the selected search text', () => {
    component.getUserData('manish').subscribe();

    const request = httpMock.expectOne('https://dummyjson.com/users/search?q=manish');
    expect(request.request.method).toBe('GET');
    request.flush({ users: [] });
  });

  it('filters young users and sorts them by first name', () => {
    let result: { firstName: string }[] = [];
    vi.useFakeTimers();
    try {
      component.user$.subscribe((users) => (result = users));
      vi.advanceTimersByTime(500);

      httpMock.expectOne('https://dummyjson.com/users/search?q=').flush({
        users: [
          { id: 1, firstName: 'Zara', lastName: 'A', age: 29, email: 'z@example.com', company: { name: 'Z' } },
          { id: 2, firstName: 'Adam', lastName: 'B', age: 18, email: 'a@example.com', company: { name: 'A' } },
          { id: 3, firstName: 'Older', lastName: 'C', age: 35, email: 'o@example.com', company: { name: 'O' } },
        ],
      });

      expect(result.map((user) => user.firstName)).toEqual(['Adam', 'Zara']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('filters old users and sorts them by age', () => {
    let result: { age: number }[] = [];
    vi.useFakeTimers();
    try {
      component.user$.subscribe((users) => (result = users));
      component.statusControl.setValue('old');
      component.sortControl.setValue('age');
      vi.advanceTimersByTime(500);

      httpMock.expectOne('https://dummyjson.com/users/search?q=').flush({
        users: [
          { id: 1, firstName: 'Thirty five', lastName: 'A', age: 35, email: 'a@example.com', company: { name: 'A' } },
          { id: 2, firstName: 'Forty', lastName: 'B', age: 40, email: 'b@example.com', company: { name: 'B' } },
          { id: 3, firstName: 'Young', lastName: 'C', age: 20, email: 'c@example.com', company: { name: 'C' } },
        ],
      });

      expect(result.map((user) => user.age)).toEqual([35, 40]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders a row per matching user', () => {
    vi.useFakeTimers();
    try {
      fixture.detectChanges();
      vi.advanceTimersByTime(500);

      httpMock.expectOne('https://dummyjson.com/users/search?q=').flush({
        users: [
          { id: 1, firstName: 'Adam', lastName: 'B', age: 18, email: 'a@example.com', company: { name: 'Acme' } },
        ],
      });

      fixture.detectChanges();

      const rows: NodeListOf<HTMLTableRowElement> = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(1);
      expect(rows[0].textContent).toContain('Adam');
      expect(fixture.nativeElement.textContent).toContain('Length:1');
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders the empty state when no user matches', () => {
    vi.useFakeTimers();
    try {
      fixture.detectChanges();
      vi.advanceTimersByTime(500);

      httpMock.expectOne('https://dummyjson.com/users/search?q=').flush({ users: [] });

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('No User Found');
    } finally {
      vi.useRealTimers();
    }
  });
});
