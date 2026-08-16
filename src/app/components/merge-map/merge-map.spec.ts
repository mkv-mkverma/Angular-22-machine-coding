import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { MergeMap } from './merge-map';

describe('MergeMap', () => {
  let component: MergeMap;
  let fixture: ComponentFixture<MergeMap>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MergeMap],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MergeMap);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('https://dummyjson.com/users').flush({ users: [] });
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('gets the user list and a user by id', () => {
    component.getUser().subscribe((response) => expect(response.users).toHaveLength(1));
    httpMock.expectOne('https://dummyjson.com/users').flush({ users: [{ id: 1 }] });

    component.getUserById(1).subscribe((response) => expect(response).toEqual({ id: 1 }));
    httpMock.expectOne('https://dummyjson.com/users/1').flush({ id: 1 });
  });

  it('loads every user detail and keeps failed requests as empty results', () => {
    const fixtureWithUsers = TestBed.createComponent(MergeMap);
    const listRequest = httpMock.expectOne('https://dummyjson.com/users');
    listRequest.flush({ users: [{ id: 1 }, { id: 2 }] });
    httpMock.expectOne('https://dummyjson.com/users/1').flush({ id: 1 });
    httpMock.expectOne('https://dummyjson.com/users/2').flush('error', { status: 500, statusText: 'Server Error' });
    fixtureWithUsers.destroy();
  });
});
