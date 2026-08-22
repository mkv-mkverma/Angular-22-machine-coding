import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { concatMap, Subject } from 'rxjs';

interface User {
  id: number;
}

interface Post {
  id: number;
}

interface PostsResponse {
  posts: Post[];
}

interface CommentsResponse {
  comments: unknown[];
}
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
  click$ = new Subject<number>();

  getPostsByUID(userId: number) {
    return this.http.get<PostsResponse>(`https://dummyjson.com/posts/user/${userId}`);
  }

  getComentsByPID(postId: number) {
    return this.http.get<CommentsResponse>(`https://dummyjson.com/posts/${postId}/comments`);
  }

  getUsersByID(id: number) {
    return this.http.get<User>(`https://dummyjson.com/users/${id}`);
  }

  loadData() {
    this.click$.next(1);
  }

  post$ = this.click$
    .pipe(
      concatMap((id) => this.getUsersByID(id)),
      concatMap((user) => this.getPostsByUID(user.id)),
      concatMap((post) => this.getComentsByPID(post.posts[0].id)),
    )
    .subscribe(console.log);
}
