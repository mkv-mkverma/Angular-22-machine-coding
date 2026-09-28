import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockPrice } from './stock-price';

describe('StockPrice', () => {
  let component: StockPrice;
  let fixture: ComponentFixture<StockPrice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockPrice],
    }).compileComponents();

    fixture = TestBed.createComponent(StockPrice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
