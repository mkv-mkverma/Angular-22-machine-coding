import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { exhaustMap, Subject } from 'rxjs';

@Component({
  selector: 'app-exhaust-map',
  imports: [],
  templateUrl: './exhaust-map.html',
  styleUrl: './exhaust-map.scss',
})
export class ExhaustMap {
  private destroyRef = inject(DestroyRef);
  private http = inject(HttpClient);

  loginClicks$ = new Subject<number>();

  constructor() {
    this.loginClicks$
      .pipe(exhaustMap((id) => this.getUserDetails(id)), takeUntilDestroyed(this.destroyRef))
      .subscribe(console.log);
  }

  onButtonClick(id: string) {
    this.loginClicks$.next(+id);
  }

  getUserDetails(id: number) {
    return this.http.get(`https://dummyjson.com/users/${id}`);
  }
}
