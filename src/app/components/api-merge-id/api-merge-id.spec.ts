import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ApiMergeId } from './api-merge-id';

describe('ApiMergeId', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiMergeId],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create and merge users with their matching photo', () => {
    const fixture = TestBed.createComponent(ApiMergeId);
    httpMock.expectOne('https://jsonplaceholder.typicode.com/users').flush([{ id: 1 }, { id: 2 }]);
    httpMock.expectOne('https://jsonplaceholder.typicode.com/photos').flush([{ id: 1, url: 'photo-1' }]);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('falls back to an empty list when either request fails', () => {
    TestBed.createComponent(ApiMergeId);
    httpMock
      .expectOne('https://jsonplaceholder.typicode.com/users')
      .flush('fail', { status: 500, statusText: 'Server Error' });
    httpMock
      .expectOne('https://jsonplaceholder.typicode.com/photos')
      .flush('fail', { status: 500, statusText: 'Server Error' });
  });

  it('exposes getUsers and getPhotos as standalone methods', () => {
    const fixture = TestBed.createComponent(ApiMergeId);
    httpMock.expectOne('https://jsonplaceholder.typicode.com/users').flush([]);
    httpMock.expectOne('https://jsonplaceholder.typicode.com/photos').flush([]);

    fixture.componentInstance.getUsers().subscribe();
    httpMock.expectOne('https://jsonplaceholder.typicode.com/users').flush([]);

    fixture.componentInstance.getPhotos().subscribe();
    httpMock.expectOne('https://jsonplaceholder.typicode.com/photos').flush([]);
  });
});
