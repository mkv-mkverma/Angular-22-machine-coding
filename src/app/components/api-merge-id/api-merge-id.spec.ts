import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiMergeId } from './api-merge-id';

describe('ApiMergeId', () => {
  let component: ApiMergeId;
  let fixture: ComponentFixture<ApiMergeId>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiMergeId],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiMergeId);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
