import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Signals } from './signals';

describe('Signals', () => {
  let component: Signals;
  let fixture: ComponentFixture<Signals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signals],
    }).compileComponents();

    fixture = TestBed.createComponent(Signals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('computes the full name from first and last name signals', () => {
    expect(component.fullName()).toBe('Manish Verma');
  });

  it('updates fullName when firstName or lastName change', () => {
    component.firstName.set('Ada');
    expect(component.fullName()).toBe('Ada Verma');

    component.lastName.set('Lovelace');
    expect(component.fullName()).toBe('Ada Lovelace');
  });

  it('handleChangeName sets firstName from the control and clears the control', () => {
    component.nameControl.setValue('Grace');

    component.handleChangeName();

    expect(component.firstName()).toBe('Grace');
    expect(component.nameControl.value).toBe('');
    expect(component.fullName()).toBe('Grace Verma');
  });

  it('computes the total price of all products', () => {
    expect(component.totalPrice()).toBe(80000 + 2000 + 3000);
  });

  it('handleAddProduct appends a Monitor and updates totalPrice', () => {
    const initialLength = component.products().length;

    component.handleAddProduct();

    expect(component.products().length).toBe(initialLength + 1);
    expect(component.products().at(-1)).toEqual({ name: 'Monitor', price: 3000 });
    expect(component.totalPrice()).toBe(80000 + 2000 + 3000 + 3000);
  });

  it('handleRemoveProduct removes the last product and updates totalPrice', () => {
    const initialLength = component.products().length;

    component.handleRemoveProduct();

    expect(component.products().length).toBe(initialLength - 1);
    expect(component.products().at(-1)?.name).toBe('Mouse');
    expect(component.totalPrice()).toBe(80000 + 2000);
  });

  it('handleRemoveProductByName removes only the matching product', () => {
    component.handleRemoveProductByName('Mouse');

    expect(component.products().map((p) => p.name)).toEqual(['Laptop', 'Keyboard']);
    expect(component.totalPrice()).toBe(80000 + 3000);
  });

  it('handleRemoveProductByName leaves products unchanged when no name matches', () => {
    const before = component.products();

    component.handleRemoveProductByName('Nonexistent');

    expect(component.products()).toEqual(before);
  });

  it('renders the full name and total price, and reacts to name-change clicks through the DOM', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Manish Verma');
    expect(fixture.nativeElement.textContent).toContain('Total Price: 85000');

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="text"]');
    input.value = 'Ada';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const changeNameButton: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    changeNameButton.click();
    fixture.detectChanges();

    expect(component.firstName()).toBe('Ada');
    expect(fixture.nativeElement.textContent).toContain('Ada Verma');
  });

  it('renders a row per product and removes it by name through the DOM', () => {
    fixture.detectChanges();

    // Scoped to direct children of the host element's own `<ul>` so we only see the product
    // list items and not `<li>`s rendered by child components (`app-todo`, `app-autocomplete`)
    // that also happen to live in the same native DOM tree.
    let rows: NodeListOf<HTMLLIElement> = fixture.nativeElement.querySelectorAll(':scope > ul > li');
    expect(rows.length).toBe(3);

    const removeButton: HTMLButtonElement = rows[0].querySelector('button')!;
    removeButton.click();
    fixture.detectChanges();

    rows = fixture.nativeElement.querySelectorAll(':scope > ul > li');
    expect(rows.length).toBe(2);
    expect(component.products().map((p) => p.name)).toEqual(['Mouse', 'Keyboard']);
  });

  it('adds and removes the last product through the DOM buttons', () => {
    fixture.detectChanges();

    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
    const addButton = Array.from(buttons).find((b) => b.textContent?.includes('Add more Product'))!;
    const removeLastButton = Array.from(buttons).find((b) => b.textContent?.includes('Remove Last Product'))!;

    addButton.click();
    fixture.detectChanges();
    expect(component.products().at(-1)).toEqual({ name: 'Monitor', price: 3000 });

    removeLastButton.click();
    fixture.detectChanges();
    expect(component.products().at(-1)?.name).toBe('Keyboard');
  });
});
