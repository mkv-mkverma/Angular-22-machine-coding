import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceApiCall } from './sequence-api-call';

describe('SequenceApiCall', () => {
  let component: SequenceApiCall;
  let fixture: ComponentFixture<SequenceApiCall>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SequenceApiCall],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SequenceApiCall);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads user posts and then comments in sequence', () => {
    component.loadData();
    httpMock.expectOne('https://dummyjson.com/users/1').flush({ id: 1 });
    httpMock.expectOne('https://dummyjson.com/posts/user/1').flush({ posts: [{ id: 10 }] });
    httpMock.expectOne('https://dummyjson.com/posts/10/comments').flush({ comments: [{ id: 100 }] });
  });

  it('provides individual API methods', () => {
    component.getUsersByID(2).subscribe();
    httpMock.expectOne('https://dummyjson.com/users/2').flush({ id: 2 });
    component.getPostsByUID(2).subscribe();
    httpMock.expectOne('https://dummyjson.com/posts/user/2').flush({ posts: [] });
    component.getComentsByPID(3).subscribe();
    httpMock.expectOne('https://dummyjson.com/posts/3/comments').flush({ comments: [] });
  });
});
