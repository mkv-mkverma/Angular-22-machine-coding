import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Todos } from './todos';

describe('Todos', () => {
  let component: Todos;
  let fixture: ComponentFixture<Todos>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Todos],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Todos);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('http://localhost:3000/getTodos').flush({
      todos: [],
      total: 0,
      skip: 0,
      limit: 30,
    });
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads todos from the mock API', () => {
    component.getTodos().subscribe((response) => expect(response.todos[0].todo).toBe('Go to the gym'));

    httpMock.expectOne('http://localhost:3000/getTodos').flush({
      todos: [{ id: 30, todo: 'Go to the gym', completed: true, userId: 142 }],
      total: 254,
      skip: 0,
      limit: 30,
    });
  });

  it('sends requests for an individual todo and todo changes', () => {
    const todo = { id: 1, todo: 'Learn testing', completed: false, userId: 1 };

    component.getTodo(1).subscribe();
    httpMock.expectOne('https://jsonplaceholder.typicode.com/todos/1').flush(todo);

    component.createTodo(todo).subscribe();
    const createRequest = httpMock.expectOne('https://jsonplaceholder.typicode.com/todos');
    expect(createRequest.request.method).toBe('POST');
    createRequest.flush(todo);

    component.updateTodo(1, todo).subscribe();
    const updateRequest = httpMock.expectOne('https://jsonplaceholder.typicode.com/todos/1');
    expect(updateRequest.request.method).toBe('PUT');
    updateRequest.flush(todo);

    component.deleteTodo(1).subscribe();
    const deleteRequest = httpMock.expectOne('https://jsonplaceholder.typicode.com/todos/1');
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);
  });
});
