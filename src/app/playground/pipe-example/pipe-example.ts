import {
  AsyncPipe,
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  JsonPipe,
  LowerCasePipe,
  PercentPipe,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import { Component, signal } from '@angular/core';
import { map, timer } from 'rxjs';
import { CapitalCasePipe } from '../../shared/pipe/capitalcase-pipe';

@Component({
  selector: 'app-pipe-example',
  imports: [
    CapitalCasePipe,
    TitleCasePipe,
    JsonPipe,
    AsyncPipe,
    LowerCasePipe,
    UpperCasePipe,
    DatePipe,
    DecimalPipe,
    PercentPipe,
    CurrencyPipe,
  ],
  templateUrl: './pipe-example.html',
  styleUrl: './pipe-example.scss',
})
export class PipeExample {
  protected readonly employee = signal([
    {
      id: 1,
      name: 'manish verma',
      age: '30',
      city: 'bengalore',
      dob: new Date(),
      salary: 1000,
    },
  ]);

  timer$ = timer(0, 1000).pipe(map(() => new Date()));
}
