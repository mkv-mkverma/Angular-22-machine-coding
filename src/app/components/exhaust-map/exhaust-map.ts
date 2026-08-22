import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { exhaustMap, Subject } from 'rxjs';

@Component({
  selector: 'app-exhaust-map',
  imports: [],
  templateUrl: './exhaust-map.html',
  styleUrl: './exhaust-map.scss',
})
export class ExhaustMap {
  private http = inject(HttpClient);

  loginClicks$ = new Subject<number>();

  constructor() {
    // takeUntilDestroyed() → Use when you're in an Angular injection context
    // like the constructor or component, so Angular can automatically get the DestroyRef.

    // takeUntilDestroyed(this.destroyRef) → Use when you're outside the injection context,
    // such as ngOnInit(), and you need to explicitly provide the DestroyRef.
    this.loginClicks$
      .pipe(
        exhaustMap((id) => this.getUserDetails(id)),
        takeUntilDestroyed(),
      )
      .subscribe(console.log);
  }

  onButtonClick(id: string) {
    this.loginClicks$.next(+id);
  }

  getUserDetails(id: number) {
    return this.http.get(`https://dummyjson.com/users/${id}`);
  }
}
