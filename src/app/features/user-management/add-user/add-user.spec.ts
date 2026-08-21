import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { AddUser } from './add-user';

describe('AddUser', () => {
  let component: AddUser;
  let fixture: ComponentFixture<AddUser>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUser],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddUser);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSubmit() posts the form values and navigates to /user/2 with replaceUrl', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.firstName.set('Jane');
    component.lastName.set('Doe');
    component.age.set('30');

    component.onSubmit();

    const req = httpMock.expectOne('https://dummyjson.com/users/add');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ firstName: 'Jane', lastName: 'Doe', age: 30 });
    req.flush({ id: 2, firstName: 'Jane', lastName: 'Doe', age: 30 });

    // Navigation is fired unconditionally right after subscribing, not gated on the response.
    expect(navigateSpy).toHaveBeenCalledWith(['/user', 2], { replaceUrl: true });
  });

  it('typing into the form fields updates the underlying signals via two-way binding', () => {
    fixture.detectChanges();

    const firstNameInput = fixture.debugElement.query(By.css('#firstName'))
      .nativeElement as HTMLInputElement;
    const lastNameInput = fixture.debugElement.query(By.css('#lastName'))
      .nativeElement as HTMLInputElement;
    const ageInput = fixture.debugElement.query(By.css('#age')).nativeElement as HTMLInputElement;

    firstNameInput.value = 'Jane';
    firstNameInput.dispatchEvent(new Event('input'));
    lastNameInput.value = 'Doe';
    lastNameInput.dispatchEvent(new Event('input'));
    ageInput.value = '30';
    ageInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.firstName()).toBe('Jane');
    expect(component.lastName()).toBe('Doe');
    expect(component.age()).toBe('30');
  });

  it('submitting the form via the DOM triggers onSubmit()', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('form')).nativeElement as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    const req = httpMock.expectOne('https://dummyjson.com/users/add');
    req.flush({ id: 2 });

    expect(navigateSpy).toHaveBeenCalledWith(['/user', 2], { replaceUrl: true });
  });
});
