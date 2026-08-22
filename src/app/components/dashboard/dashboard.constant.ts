export interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  route: string;
}

export const DASHBOARD_CARDS: DashboardCard[] = [
  {
    title: 'Exhaust Map',
    description: 'Ignores new clicks while the current request is in progress.',
    icon: '⇢',
    route: '/exhaust-map',
  },
  {
    title: 'Short Polling',
    description: 'Refreshes data automatically at a fixed interval.',
    icon: '↻',
    route: '/short-polling',
  },
  {
    title: 'Retry',
    description: 'Retries a failed request automatically.',
    icon: '↻',
    route: '/retry',
  },
  {
    title: 'Retry When',
    description: 'Retries only retryable errors with a delay.',
    icon: '⟳',
    route: '/retry-when',
  },
  {
    title: 'User Profile',
    description: 'Loads a user profile using a route parameter.',
    icon: '👤',
    route: '/profile/1',
  },
  {
    title: 'Merge Map',
    description: 'Runs inner requests concurrently and merges results as they arrive.',
    icon: '⇉',
    route: '/merge-map',
  },
  {
    title: 'Combine Latest',
    description: 'Combines the latest values from multiple form controls into one stream.',
    icon: '⊕',
    route: '/combine-latest',
  },
  {
    title: 'Api Merge Id',
    description: 'Joins two API responses by id using a map lookup for O(n) performance.',
    icon: '🔗',
    route: '/api-merge-id',
  },
  {
    title: 'Cached Api',
    description: 'Shares one HTTP request across multiple subscribers via shareReplay.',
    icon: '💾',
    route: '/cached-api',
  },
  {
    title: 'Sequence Api Call',
    description: 'Chains dependent API calls in sequence with concatMap.',
    icon: '➡️',
    route: '/sequence-api-call',
  },
  {
    title: 'User Filter',
    description: 'Combines search, sort, and status form controls into one filtered API request.',
    icon: '🔍',
    route: '/user-filter',
  },
];
