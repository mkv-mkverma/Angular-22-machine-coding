import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { from, map, mergeMap, tap, toArray } from 'rxjs';

@Component({
  selector: 'app-merge-map',
  imports: [],
  templateUrl: './merge-map.html',
  styleUrl: './merge-map.scss',
})
export class MergeMap {
  private http = inject(HttpClient);

  getUser() {
    return this.http.get<any>('https://dummyjson.com/users');
  }

  getUserById(id: number) {
    return this.http.get(`https://dummyjson.com/users/${id}`);
  }

  // how to call All users by Id

  data = this.getUser()
  .pipe(
    mergeMap(user=>from(user.users)),
    mergeMap((u:any)=>this.getUserById(u.id)),
    toArray()
  )
  .subscribe(console.log)
}
