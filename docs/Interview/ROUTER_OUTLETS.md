# Dual Router Outlets

## app.routes.ts
```ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home-component/home-component';
import { SidebarComponent } from './sidebar-component/sidebar-component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'sidebar',
    component: SidebarComponent,
    outlet: 'sidebar',
  },
];
```


## app.html
```html
<h1>{{ title() }}</h1>

<div class="layout">
  <main>
    <!-- Primary outlet -->
    <router-outlet></router-outlet>
  </main>

  <aside>
    <!-- Named outlet -->
    <router-outlet name="sidebar"></router-outlet>
  </aside>
</div>
```

## app.scss
```scss
.layout {
  display: flex;
  gap: 10px;
  justify-content: space-between;
}
```

## home-component.ts
```ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-home-component',
  styleUrl: './home-component.scss',
  templateUrl: './home-component.html',
})
export class HomeComponent {
  private readonly router = inject(Router);
  openSidebar() {
    this.router.navigate([
      {
        outlets: {
          sidebar: ['sidebar'],
        },
      },
    ]);
  }
}
```

## home-component.html
```html
<h2>Home</h2>

<p>This is the primary router outlet.</p>

<button (click)="openSidebar()">Open Sidebar</button>
```

## sidebar-component.ts
```ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-sidebar-component',
  styleUrl: './sidebar-component.scss',
  templateUrl: './sidebar-component.html',
})
export class SidebarComponent {
  private readonly router = inject(Router);

  closeSidebar() {
    this.router.navigate([
      {
        outlets: {
          sidebar: null,
        },
      },
    ]);
  }
}
```

## sidebar-component.html
```html
<h2>Sidebar</h2>

<p>I am rendered inside the named outlet.</p>

<button (click)="closeSidebar()">Close</button>
```
