import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Store } from './store';

describe('Store', () => {
  let service: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Store);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts with an empty todo list', () => {
    expect(service.getTodo()()).toEqual([]);
    expect(service.getTodoLength()()).toBe(0);
  });

  it('adds a todo with an id and the given task', () => {
    service.addTodo('Buy milk');

    const todos = service.getTodo()();
    expect(todos.length).toBe(1);
    expect(todos[0].task).toBe('Buy milk');
    expect(typeof todos[0].id).toBe('number');
  });

  it('appends todos and updates the length signal', () => {
    service.addTodo('First');
    service.addTodo('Second');

    expect(service.getTodo()().map((t) => t.task)).toEqual(['First', 'Second']);
    expect(service.getTodoLength()()).toBe(2);
  });

  it('updates the task of the matching todo id', () => {
    service.addTodo('Buy milk');
    const id = service.getTodo()()[0].id;

    service.updateTodo(id, 'Buy oat milk');

    expect(service.getTodo()()[0].task).toBe('Buy oat milk');
  });

  it('leaves todos unchanged when updateTodo is called with a non-matching id', () => {
    service.addTodo('Buy milk');

    service.updateTodo(-1, 'Should not apply');

    expect(service.getTodo()()[0].task).toBe('Buy milk');
  });

  it('leaves todos unchanged when updateTodo is called with a null id', () => {
    service.addTodo('Buy milk');

    service.updateTodo(null, 'Should not apply');

    expect(service.getTodo()()[0].task).toBe('Buy milk');
  });

  it('deletes the todo with the matching id', () => {
    // `addTodo` derives the id from `Date.now()`; stub it so two rapid adds in the
    // same test don't collide on the same millisecond and produce duplicate ids.
    const dateNowSpy = vi.spyOn(Date, 'now');
    dateNowSpy.mockReturnValueOnce(1).mockReturnValueOnce(2);
    service.addTodo('Buy milk');
    service.addTodo('Walk dog');
    dateNowSpy.mockRestore();
    const [first, second] = service.getTodo()();

    service.deleteTodo(first.id);

    expect(service.getTodo()()).toEqual([second]);
    expect(service.getTodoLength()()).toBe(1);
  });

  it('leaves todos unchanged when deleteTodo is called with a non-matching id', () => {
    service.addTodo('Buy milk');

    service.deleteTodo(-1);

    expect(service.getTodo()().length).toBe(1);
  });
});
