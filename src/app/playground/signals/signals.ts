import { Component, computed, effect, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Autocomplete } from './autocomplete/autocomplete';
import { Forms } from './forms/forms';

@Component({
  selector: 'app-signals',
  imports: [ReactiveFormsModule, Autocomplete, Forms],
  templateUrl: './signals.html',
  styleUrl: './signals.scss',
})
export class Signals {
  nameControl = new FormControl('', { nonNullable: true });
  firstName = signal<string>('Manish');
  lastName = signal<string>('Verma');
  count = signal<number>(0);

  fullName = computed(() => `${this.firstName()} ${this.lastName()}`);

  handleChangeName() {
    this.firstName.set(this.nameControl.value);
    this.nameControl.setValue('');
  }

  products = signal([
    { name: 'Laptop', price: 80000 },
    { name: 'Mouse', price: 2000 },
    { name: 'Keyboard', price: 3000 },
  ]);

  totalPrice = computed(() => {
    return this.products().reduce((acc, curr) => acc + curr.price, 0);
  });

  handleAddProduct() {
    const product = { name: 'Monitor', price: 3000 };
    this.products.update((p) => [...p, product]);
  }

  handleRemoveProduct() {
    this.products.update((p) => p.slice(0, -1));
  }

  handleRemoveProductByName(name: string) {
    this.products.update((p) => p.filter((product) => product.name !== name));
  }

  constructor() {
    /**
     * effect() is an Angular Signals API used for side effects. 
     * It automatically tracks the signals read inside its callback and 
     * reruns when those signals change. 
     * I would use it for things like logging, analytics, 
     * localStorage synchronization, or interacting with external APIs. 
     * I wouldn't normally use an effect to calculate derived state; 
     * for that I would use computed(). 
     * Signals manage state, computed derives state, 
     * and effects handle side effects."
     */

    // Logging,
    effect(() => {
      console.log('First name change:', this.firstName());
    });

    // LocalStorage,
    effect(() => {
      localStorage.setItem('theme', this.lastName());
    });

    effect((onCleanup) => {
      const timer = setInterval(() => {
        console.log(this.count());
      }, 1000);

      onCleanup(() => {
        clearInterval(timer);
      });
    });
  }
}
