import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Todo } from './todo';

describe('Todo', () => {
  let component: Todo;
  let fixture: ComponentFixture<Todo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Todo],
    }).compileComponents();

    fixture = TestBed.createComponent(Todo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts with an empty task, no active edit, and no todos', () => {
    expect(component.task()).toBe('');
    expect(component.editId()).toBeNull();
    expect(component.todos()).toEqual([]);
    expect(component.todosLength()).toBe(0);
  });

  it('adds a new todo on submit and resets the task field', () => {
    component.task.set('Buy milk');
    const event = new Event('submit', { cancelable: true });

    component.onSubmit(event);

    expect(component.todos().length).toBe(1);
    expect(component.todos()[0].task).toBe('Buy milk');
    expect(component.task()).toBe('');
    expect(component.todosLength()).toBe(1);
  });

  it('appends multiple todos on repeated submits', () => {
    component.task.set('First');
    component.onSubmit(new Event('submit', { cancelable: true }));
    component.task.set('Second');
    component.onSubmit(new Event('submit', { cancelable: true }));

    expect(component.todos().map((t) => t.task)).toEqual(['First', 'Second']);
    expect(component.todosLength()).toBe(2);
  });

  // Known bug: `taskForm().valid` is a Signal<boolean> function reference, never invoked
  // in onSubmit (`if (!this.taskForm().valid)`). A function is always truthy, so this guard
  // never returns early and invalid input (empty, or longer than the maxLength(10) rule)
  // is still added to the store instead of being rejected. These tests document that
  // current (buggy) behavior; they should be revisited once the guard is fixed to call
  // `this.taskForm().valid()`.
  it('documents a validation bug: an empty task is still added despite the required() rule', () => {
    component.task.set('');

    component.onSubmit(new Event('submit', { cancelable: true }));

    expect(component.todos().length).toBe(1);
    expect(component.todos()[0].task).toBe('');
  });

  it('documents a validation bug: a task longer than maxLength(10) is still added', () => {
    component.task.set('this-is-way-too-long');

    component.onSubmit(new Event('submit', { cancelable: true }));

    expect(component.todos().length).toBe(1);
    expect(component.todos()[0].task).toBe('this-is-way-too-long');
  });

  it('calls preventDefault when a valid submit adds a todo', () => {
    component.task.set('Buy milk');
    const event = new Event('submit', { cancelable: true });

    component.onSubmit(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('populates task and editId when editing a todo', () => {
    component.task.set('Buy milk');
    component.onSubmit(new Event('submit', { cancelable: true }));
    const todo = component.todos()[0];

    component.onEdit(todo);

    expect(component.editId()).toBe(todo.id);
    expect(component.task()).toBe('Buy milk');
  });

  it('updates the matching todo on onUpdate and clears edit state', () => {
    component.task.set('Buy milk');
    component.onSubmit(new Event('submit', { cancelable: true }));
    const todo = component.todos()[0];
    component.onEdit(todo);
    component.task.set('Buy oat milk');

    component.onUpdate(new Event('submit', { cancelable: true }));

    expect(component.todos()[0].task).toBe('Buy oat milk');
    expect(component.editId()).toBeNull();
    expect(component.task()).toBe('');
  });

  // Known bug: onUpdate never checks `this.taskForm().valid` before calling
  // `store.updateTodo`, unlike onSubmit which at least attempts a (broken) check.
  // Any value in `task` -- including an empty string -- overwrites the todo being edited.
  it('documents a validation bug: onUpdate applies an empty task with no validation', () => {
    component.task.set('Buy milk');
    component.onSubmit(new Event('submit', { cancelable: true }));
    const todo = component.todos()[0];
    component.onEdit(todo);
    component.task.set('');

    component.onUpdate(new Event('submit', { cancelable: true }));

    expect(component.todos()[0].task).toBe('');
  });

  it('leaves todos unchanged when onUpdate runs without an active edit', () => {
    component.task.set('Buy milk');
    component.onSubmit(new Event('submit', { cancelable: true }));

    component.task.set('Should not apply');
    component.onUpdate(new Event('submit', { cancelable: true }));

    expect(component.todos()[0].task).toBe('Buy milk');
  });

  it('deletes the matching todo', () => {
    // `addTodo` derives the id from `Date.now()`; stub it so two rapid submits in the
    // same test don't collide on the same millisecond and produce duplicate ids.
    const dateNowSpy = vi.spyOn(Date, 'now');
    dateNowSpy.mockReturnValueOnce(1).mockReturnValueOnce(2);
    component.task.set('Buy milk');
    component.onSubmit(new Event('submit', { cancelable: true }));
    component.task.set('Walk dog');
    component.onSubmit(new Event('submit', { cancelable: true }));
    dateNowSpy.mockRestore();
    const [first, second] = component.todos();

    component.onDelete(first.id);

    expect(component.todos()).toEqual([second]);
    expect(component.todosLength()).toBe(1);
  });

  it('renders the empty state message when there are no todos', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No Task Available');
  });

  it('renders a list item per todo and supports edit/delete through the DOM', () => {
    component.task.set('Buy milk');
    component.onSubmit(new Event('submit', { cancelable: true }));
    fixture.detectChanges();

    const items: NodeListOf<HTMLLIElement> = fixture.nativeElement.querySelectorAll('li');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Buy milk');

    const editButton: HTMLButtonElement = fixture.nativeElement.querySelector('li button');
    editButton.click();
    fixture.detectChanges();
    expect(component.editId()).toBe(component.todos()[0].id);

    const deleteButton: HTMLButtonElement = fixture.nativeElement.querySelectorAll('li button')[1];
    deleteButton.click();
    fixture.detectChanges();
    expect(component.todos().length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('No Task Available');
  });

  it('routes submit to onUpdate through the template when editing', () => {
    component.task.set('Buy milk');
    component.onSubmit(new Event('submit', { cancelable: true }));
    const todo = component.todos()[0];
    component.onEdit(todo);
    fixture.detectChanges();
    component.task.set('Buy oat milk');

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();

    expect(component.todos()[0].task).toBe('Buy oat milk');
    expect(component.editId()).toBeNull();
  });
});
