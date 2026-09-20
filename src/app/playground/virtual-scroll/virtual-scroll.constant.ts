import type { Item } from './virtual-scroll';

export const VIRTUAL_SCROLL_ITEMS: Item[] = Array.from({ length: 10000 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));
