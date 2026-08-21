import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { User } from './user';

describe('User', () => {
  let component: User;
  let fixture: ComponentFixture<User>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [User],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(User);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('user', {
      id: 1,
      firstName: 'Jane',
      lastName: 'Doe',
      age: 30,
      image: 'https://example.com/avatar.png',
    });
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('delete() emits the deleted id when the delete request succeeds', () => {
    let emitted: number | undefined;
    component.deleted.subscribe((id) => (emitted = id));

    component.delete(1);

    const req = httpMock.expectOne('https://dummyjson.com/users/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ id: 1, isDeleted: true });

    expect(emitted).toBe(1);
  });

  it('delete() logs the error and does not emit when the delete request fails', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let emitted: number | undefined;
    component.deleted.subscribe((id) => (emitted = id));

    component.delete(1);

    const req = httpMock.expectOne('https://dummyjson.com/users/1');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(errorSpy).toHaveBeenCalled();
    expect(emitted).toBeUndefined();
  });
});
