import { Component, inject, signal } from '@angular/core';
import { ITodo, Store } from './store';
import { form, FormField, maxLength, minLength, required } from '@angular/forms/signals';

@Component({
  selector: 'app-todo',
  imports: [FormField],
  templateUrl: './todo.html',
  styleUrl: './todo.scss',
})
export class Todo {
  private readonly store = inject(Store);

  task = signal<string>('');
  editId = signal<number | null>(null);
  taskForm = form(this.task, (schema) => {
    required(schema);
    minLength(schema, 1);
    maxLength(schema, 10);
  });

  todos = this.store.getTodo();
  todosLength = this.store.getTodoLength();

  onSubmit(e: Event) {
    if (!this.taskForm().valid) {
      return;
    }
    this.store.addTodo(this.task());
    this.task.set('');
    e.preventDefault();
  }

  onEdit(todo: ITodo) {
    this.editId.set(todo.id);
    this.task.set(todo.task);
  }

  onUpdate(e: Event) {
    this.store.updateTodo(this.editId(), this.task());
    this.task.set('');
    this.editId.set(null);
    e.preventDefault();
  }

  onDelete(id: number) {
    this.store.deleteTodo(id);
  }
}
