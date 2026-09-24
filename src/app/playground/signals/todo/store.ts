import { computed, Service, signal } from '@angular/core';

export interface ITodo {
  id: number;
  task: string;
}

@Service()
export class Store {
  todos = signal<ITodo[]>([]);

  getTodo() {
    return this.todos;
  }

  getTodoLength() {
    return computed(() => this.todos().length);
  }

  addTodo(task: string) {
    const todo: ITodo = {
      id: Date.now(),
      task: task,
    };
    this.todos.update((p) => [...p, todo]);
  }

  updateTodo(id: number | null, task: string) {
    this.todos.update((p) => p.map((item) => (item.id === id ? { ...item, task } : item)));
  }

  deleteTodo(id: number) {
    this.todos.update((p) => p.filter((item) => item.id !== id));
  }
}
