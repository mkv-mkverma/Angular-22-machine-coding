import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

interface ITodos {
  userId: number;
  id: number;
  todo: string;
  completed: boolean;
}

interface TodosResponse {
  todos: ITodos[];
  total: number;
  skip: number;
  limit: number;
}

@Component({
  selector: 'app-todos',
  imports: [],
  templateUrl: './todos.html',
  styleUrl: './todos.scss',
})
export class Todos {
  private http = inject(HttpClient);

  todos = toSignal(this.getTodos().pipe(map((response) => response.todos)), { initialValue: [] });

  getTodos() {
    return this.http.get<TodosResponse>('https://dummyjson.com/todos');
    // return this.http.get<TodosResponse>('http://localhost:3000/getTodos');
  }

  getTodo(id: number) {
    return this.http.get<ITodos>(`https://jsonplaceholder.typicode.com/todos/${id}`);
  }

  createTodo(todo: ITodos) {
    return this.http.post('https://jsonplaceholder.typicode.com/todos', todo);
  }

  updateTodo(id: number, todo: ITodos) {
    return this.http.put(`https://jsonplaceholder.typicode.com/todos/${id}`, todo);
  }

  deleteTodo(id: number) {
    return this.http.delete(`https://jsonplaceholder.typicode.com/todos/${id}`);
  }
}
