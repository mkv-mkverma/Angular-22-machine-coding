import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { concatMap, map, tap } from 'rxjs';
/**
 * https://dummyjson.com/users/1
https://dummyjson.com/posts/user/${userId}
https://dummyjson.com/posts/${postId}/comments

getUser()
      ↓
getPosts(user.id)
      ↓
getComments(post.id)
 */
@Component({
  selector: 'app-sequence-api-call',
  imports: [],
  templateUrl: './sequence-api-call.html',
  styleUrl: './sequence-api-call.scss',
})
export class SequenceApiCall {
  private http = inject(HttpClient);

  getPostsByUID(userId: number) {
    return this.http.get<any>(`https://dummyjson.com/posts/user/${userId}`);
  }

  getComentsByPID(postId: number) {
    return this.http.get<any>(`https://dummyjson.com/posts/${postId}/comments`);
  }

  getUsersByID(id: number) {
    return this.http.get<any>(`https://dummyjson.com/users/${id}`);
  }

  loadData() {
    this.getUsersByID(1)
      .pipe(
        map((e) => e.id),
        concatMap((id) => this.getPostsByUID(id)),
        map((e) => e.posts[0].id),
        concatMap((pid) => this.getComentsByPID(pid)),
      )
      .subscribe(console.log);
  }
}
