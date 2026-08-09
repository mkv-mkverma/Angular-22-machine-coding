import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CachedApi } from './cached-api';
import { Users } from '../../services/users';

describe('CachedApi', () => {
  let component: CachedApi;
  let fixture: ComponentFixture<CachedApi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CachedApi],
      providers: [
        {
          provide: Users,
          useValue: { getuserCashed: () => of([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CachedApi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
