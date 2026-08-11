import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { MergeMap } from './merge-map';

describe('MergeMap', () => {
  let component: MergeMap;
  let fixture: ComponentFixture<MergeMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MergeMap],
      providers: [
        {
          provide: HttpClient,
          useValue: { get: () => of({ users: [] }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MergeMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
