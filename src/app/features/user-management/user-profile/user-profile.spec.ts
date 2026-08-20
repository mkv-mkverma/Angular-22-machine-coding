import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { UserProfile } from './user-profile';

describe('UserProfile', () => {
  let component: UserProfile;
  let fixture: ComponentFixture<UserProfile>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfile],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ userId: '1' })) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfile);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('userId', '1');
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    // The component issues one request via the `user` signal (userId input)
    // and a second via `firstName` (ActivatedRoute paramMap subscription).
    for (const req of httpMock.match('https://dummyjson.com/users/1')) {
      req.flush({
        id: 1,
        firstName: 'Jane',
        lastName: 'Doe',
        age: 30,
        image: 'https://example.com/avatar.png',
      });
    }
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('UserProfile when the ActivatedRoute paramMap stream errors', () => {
  let fixture: ComponentFixture<UserProfile>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfile],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: throwError(() => new Error('boom')) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfile);
    fixture.componentRef.setInput('userId', '1');
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('logs the error via console.error when the paramMap subscription errors', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    fixture.detectChanges();
    // The component still issues one request via the `user` signal (userId input).
    httpMock.expectOne('https://dummyjson.com/users/1').flush({
      id: 1,
      firstName: 'Jane',
      lastName: 'Doe',
      age: 30,
      image: 'https://example.com/avatar.png',
    });
    await fixture.whenStable();

    expect(errorSpy).toHaveBeenCalledWith(new Error('boom'));
  });
});
