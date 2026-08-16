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

export const routes: Routes = [
  // Add route top to bottom
  {
    path: '',
    component: Dashboard,
    pathMatch: 'full',
    resolve: {
      dashboardResolver,
    },
  },
  {
    path: 'exhaust-map',
    component: ExhaustMap,
  },
  {
    path: 'short-polling',
    component: ShortPolling,
  },
  {
    path: 'retry',
    component: Retry,
  },
  {
    path: 'retry-when',
    component: RetryWhen,
  },
  {
    path: 'autocomplete',
    component: AutoComplete,
  },
  {
    path: 'profile/:id',
    component: Profile,
  },
  {
    path: 'todos',
    component: Todos,
  },
  {
    path: '**',
    component: PageNotFound,
  },
];
