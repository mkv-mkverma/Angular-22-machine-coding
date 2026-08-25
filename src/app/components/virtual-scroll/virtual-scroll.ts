import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { Component } from '@angular/core';
import { VIRTUAL_SCROLL_ITEMS } from './virtual-scroll.constant';
import { CommonModule } from '@angular/common';
// npm install @angular/cdk
export interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'app-virtual-scroll',
  imports: [CdkVirtualScrollViewport, CdkVirtualForOf, CdkFixedSizeVirtualScroll, CommonModule],
  templateUrl: './virtual-scroll.html',
  styleUrl: './virtual-scroll.scss',
})
export class VirtualScroll {
  items: Item[] = VIRTUAL_SCROLL_ITEMS;

  trackById(index: number, item: Item) {
    return item.id;
  }
}
