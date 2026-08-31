import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { PageNotFound } from './components/page-not-found/page-not-found';
import { dashboardResolver, dashboardResolverTest } from './resolvers/dashboard-resolver';
import { Profile } from './profile/components/profile/profile';
import { Users } from './features/users/users';
import { UserManagement } from './features/user-management/user-management';
export const routes: Routes = [
  // Add route top to bottom
  {
    path: '', // domain-name/
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Dashboard',
    runGuardsAndResolvers: 'always',
    resolve: {
      dashboardResolver,
      dashboardResolverTest,
    },
    data: { message: 'Hello' },
  },
  // EGERLY Loading
  {
    path: 'users',
    component: Users,
    title: 'Users',
  },
  // LAZY Loaded
  {
    path: 'user',
    component: UserManagement,
    title: 'User Management',
    loadChildren: () =>
      import('./features/user-management/user-management.route').then((r) => r.routes),
    // children: usersManagementRoutes,
  },
  // Preloading + Lazy Loading
  {
    path: 'virtual-scroll',
    title: 'virtual-Scroll',
    loadComponent: () =>
      import('./components/virtual-scroll/virtual-scroll').then((c) => c.VirtualScroll),
    data: {
      preload: true,
    },
  },
  {
    path: 'exhaust-map',
    title: 'Exhaust Map',
    loadComponent: () => import('./components/exhaust-map/exhaust-map').then((c) => c.ExhaustMap),
  },
  {
    path: 'short-polling',
    title: 'Short Polling',
    loadComponent: () =>
      import('./components/short-polling/short-polling').then((c) => c.ShortPolling),
  },
  {
    path: 'retry',
    title: 'Retry',
    loadComponent: () => import('./components/retry/retry').then((c) => c.Retry),
  },
  {
    path: 'retry-when',
    title: 'Retry When',
    loadComponent: () => import('./components/retry-when/retry-when').then((c) => c.RetryWhen),
  },
  {
    path: 'autocomplete',
    title: 'Autocomplete',
    loadComponent: () =>
      import('./components/auto-complete/auto-complete').then((c) => c.AutoComplete),
    data: {
      preload: true,
    },
  },
  {
    path: 'profile/:id',
    component: Profile,
    title: 'Profile',
  },
  {
    path: 'todos',
    title: 'Todos',
    loadComponent: () => import('./components/todos/todos').then((c) => c.Todos),
  },
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./features/login/login').then((c) => c.Login),
  },

  {
    path: 'merge-map',
    title: 'Merge Map',
    loadComponent: () => import('./components/merge-map/merge-map').then((c) => c.MergeMap),
  },
  {
    path: 'combine-latest',
    title: 'Combine Latest',
    loadComponent: () =>
      import('./components/combine-latest/combine-latest').then((c) => c.CombineLatest),
  },
  {
    path: 'api-merge-id',
    title: 'Api Merge Id',
    loadComponent: () => import('./components/api-merge-id/api-merge-id').then((c) => c.ApiMergeId),
  },
  {
    path: 'cached-api',
    title: 'Cached Api',
    loadComponent: () => import('./components/cached-api/cached-api').then((c) => c.CachedApi),
  },
  {
    path: 'sequence-api-call',
    title: 'Sequence Api Call',
    loadComponent: () =>
      import('./components/sequence-api-call/sequence-api-call').then((c) => c.SequenceApiCall),
  },
  {
    path: 'user-filter',
    title: 'User Filter',
    loadComponent: () => import('./components/user-filter/user-filter').then((c) => c.UserFilter),
  },
  {
    path: 'rx',
    title: 'rx-resource',
    loadComponent: () => import('./components/rxresource/rxresource').then((c) => c.Rxresource),
  },
  {
    path: 'memory-leak',
    title: 'Memory Leak',
    loadComponent: () => import('./components/memory-leak/memory-leak').then((c) => c.MemoryLeak),
  },
  {
    path: 'error-component',
    title: 'Global Error Component',
    loadComponent: () =>
      import('./components/global-error-component/global-error-component').then(
        (c) => c.GlobalErrorComponent,
      ),
  },
  {
    path: '**',
    component: PageNotFound,
    title: 'Page Not Found',
  },
];
