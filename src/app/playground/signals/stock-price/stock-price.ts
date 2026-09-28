import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, pairwise, timer } from 'rxjs';

@Component({
  selector: 'app-stock-price',
  imports: [NgClass],
  templateUrl: './stock-price.html',
  styleUrl: './stock-price.scss',
})
export class StockPrice {
  stockPrice$ = timer(0, 1000).pipe(map((e) => e * Math.random()));
  // values$ = of(10, 15, 12, 20, 18, 21, 90,);
  // stockPrice$ = of(1, 2, 5, 7, 2, 3, 1, 10).pipe(concatMap((e) => of(e).pipe(delay(1000))));

  displayTrends$ = this.stockPrice$.pipe(
    pairwise(),
    map(([prev, curr]) => {
      if (prev < curr) {
        return 'Up';
      } else if (prev > curr) {
        return 'Down';
      }
      return 'No change';
    }),
  );
  // .subscribe(console.log);

  displayTrends = toSignal(this.displayTrends$, { initialValue: 'No change' });
}
