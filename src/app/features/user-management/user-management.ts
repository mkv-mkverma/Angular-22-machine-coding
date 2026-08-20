import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { UserManagementService } from './service/user-management';
import { map } from 'rxjs';
import { User } from './user/user';
import { RouterOutlet, RouterLinkWithHref, RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-management',
  imports: [User, RouterOutlet, RouterLinkWithHref, RouterLink],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement implements OnInit {
  order = input<'asc' | 'desc'>();
  private userManagementService = inject(UserManagementService);

  private allUsers = toSignal(
    this.userManagementService.getUsers().pipe(map((response) => response.users)),
    { initialValue: [] },
  );

  // ids removed locally after a successful delete, since allUsers() itself is read-only
  private deletedIds = signal<number[]>([]);

  users = computed(() => this.allUsers().filter((user) => !this.deletedIds().includes(user.id)));

  onUserDeleted(userId: number) {
    this.deletedIds.update((ids) => [...ids, userId]);
  }

  // Alternative way for query params

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  orderI?: 'asc' | 'desc';
  ngOnInit() {
    this.activatedRoute.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (queryParams) => {
        this.orderI = queryParams.get('order') === 'desc' ? 'desc' : 'asc';
      },
    });
  }
}
