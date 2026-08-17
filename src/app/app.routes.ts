import { Routes } from '@angular/router';
import { AutoComplete } from './components/auto-complete/auto-complete';
import { Dashboard } from './components/dashboard/dashboard';
import { ExhaustMap } from './components/exhaust-map/exhaust-map';
import { PageNotFound } from './components/page-not-found/page-not-found';
import { ShortPolling } from './components/short-polling/short-polling';
import { Retry } from './components/retry/retry';
import { RetryWhen } from './components/retry-when/retry-when';
import { dashboardResolver } from './resolvers/dashboard-resolver';
import { Profile } from './profile/components/profile/profile';
import { Todos } from './components/todos/todos';
import { Login } from './features/login/login';
import { Users } from './features/users/users';

export const routes: Routes = [
  // Add route top to bottom
  {
    path: '',
    component: Dashboard,
    title: 'Dashboard',
    pathMatch: 'full',
    resolve: {
      dashboardResolver,
    },
  },
  {
    path: 'exhaust-map',
    component: ExhaustMap,
    title: 'Exhaust Map',
  },
  {
    path: 'short-polling',
    component: ShortPolling,
    title: 'Short Polling',
  },
  {
    path: 'retry',
    component: Retry,
    title: 'Retry',
  },
  {
    path: 'retry-when',
    component: RetryWhen,
    title: 'Retry When',
  },
  {
    path: 'autocomplete',
    component: AutoComplete,
    title: 'Autocomplete',
  },
  {
    path: 'profile/:id',
    component: Profile,
    title: 'Profile',
  },
  {
    path: 'todos',
    component: Todos,
    title: 'Todos',
  },
  {
    path: 'login',
    component: Login,
    title: 'Login',
  },
  {
    path: 'users',
    component: Users,
    title: 'Users',
  },
  {
    path: '**',
    component: PageNotFound,
    title: 'Page Not Found',
  },
];
