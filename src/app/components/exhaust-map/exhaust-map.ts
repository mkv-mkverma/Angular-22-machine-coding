import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { Cons, exhaustMap, fromEvent, Subject } from 'rxjs';

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
    this.loginClicks$.pipe(exhaustMap((id) => this.getUserDetails(id))).subscribe(console.log);
  }

  onButtonClick(id: string) {
    this.loginClicks$.next(+id);
  }

  getUserDetails(id: number) {
    return this.http.get(`https://dummyjson.com/users/${id}`);
  }
}
