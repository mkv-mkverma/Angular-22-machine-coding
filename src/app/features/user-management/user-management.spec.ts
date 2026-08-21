import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { UserManagement } from './user-management';

describe('UserManagement', () => {
  let component: UserManagement;
  let fixture: ComponentFixture<UserManagement>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagement],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({})) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagement);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('https://dummyjson.com/users').flush({
      users: [],
      total: 0,
      skip: 0,
      limit: 30,
    });
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults orderI to "asc" when the order query param is absent', () => {
    expect(component.orderI).toBe('asc');
  });

  it('renders the empty state when there are no users', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No users Found!');
  });
});

describe('UserManagement with order=desc query param', () => {
  let component: UserManagement;
  let fixture: ComponentFixture<UserManagement>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagement],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({ order: 'desc' })) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagement);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('https://dummyjson.com/users').flush({
      users: [],
      total: 0,
      skip: 0,
      limit: 30,
    });
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('sets orderI to "desc" when the order query param is "desc"', () => {
    expect(component.orderI).toBe('desc');
  });
});

describe('UserManagement with a non-empty user list', () => {
  let component: UserManagement;
  let fixture: ComponentFixture<UserManagement>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagement],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({})) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagement);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('https://dummyjson.com/users').flush({
      users: [
        { id: 1, firstName: 'Jane', lastName: 'Doe', age: 30, image: 'x' },
        { id: 2, firstName: 'John', lastName: 'Smith', age: 40, image: 'y' },
      ],
      total: 2,
      skip: 0,
      limit: 30,
    });
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('renders a list item per user instead of the empty state', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('No users Found!');
    expect(compiled.querySelectorAll('app-user').length).toBe(2);
  });

  it('onUserDeleted() removes the given user id from the visible users list', () => {
    expect(component.users().map((u) => u.id)).toEqual([1, 2]);

    component.onUserDeleted(1);

    expect(component.users().map((u) => u.id)).toEqual([2]);
  });
});
