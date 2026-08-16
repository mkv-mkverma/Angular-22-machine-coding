import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExhaustMap } from './exhaust-map';

describe('ExhaustMap', () => {
  let component: ExhaustMap;
  let fixture: ComponentFixture<ExhaustMap>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExhaustMap],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ExhaustMap);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ignores clicks while the current user request is active', () => {
    component.onButtonClick('2');
    component.onButtonClick('3');

    httpMock.expectOne('https://dummyjson.com/users/2').flush({ id: 2 });
    httpMock.expectNone('https://dummyjson.com/users/3');
  });

  it('gets user details by id', () => {
    component.getUserDetails(4).subscribe((user) => expect(user).toEqual({ id: 4 }));
    httpMock.expectOne('https://dummyjson.com/users/4').flush({ id: 4 });
  });
});
