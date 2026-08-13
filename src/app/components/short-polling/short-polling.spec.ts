import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { API_URL } from '../core/tokens/api-url.token';
import { ShortPolling } from './short-polling';

describe('ShortPolling', () => {
  let component: ShortPolling;
  let fixture: ComponentFixture<ShortPolling>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortPolling],
      providers: [
        { provide: API_URL, useValue: 'https://jsonplaceholder.typicode.com' },
        { provide: HttpClient, useValue: { get: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShortPolling);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
