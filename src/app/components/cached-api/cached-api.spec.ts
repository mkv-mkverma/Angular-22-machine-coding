import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CachedApi } from './cached-api';

describe('CachedApi', () => {
  let component: CachedApi;
  let fixture: ComponentFixture<CachedApi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CachedApi],
    }).compileComponents();

    fixture = TestBed.createComponent(CachedApi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
