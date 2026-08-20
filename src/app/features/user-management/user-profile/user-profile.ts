import { Component, computed, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, Observable, switchMap } from 'rxjs';
import { UserManagementService } from '../service/user-management';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  imports: [AsyncPipe, RouterOutlet, RouterLink],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
  private userManagementService = inject(UserManagementService);

  // userId should be same as path: 'user/:userId',
  // this userId coming from url
  userId = input.required<string>();

  user = toSignal(
    toObservable(this.userId).pipe(switchMap((id) => this.userManagementService.getUser(+id))),
  );

  userName = computed(() => `${this.user()?.firstName} ${this.user()?.lastName}`);

  // Alternative way
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  public firstName!: Observable<string>;

  ngOnInit() {
    // we get actual value instead of observable but its not reactive
    // this.activatedRoute.snapshot.paramMap.get('userId')
    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (paramMap) => {
        const id = paramMap.get('userId') || '';
        this.firstName = this.userManagementService
          .getUser(+id)
          .pipe(map((user) => user.firstName));
      },
      error: (e) => console.error(e),
      complete: () => console.log('Completed'),
    });
  }
}
