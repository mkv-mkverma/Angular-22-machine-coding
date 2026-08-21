import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { UserManagementService } from '../service/user-management';

export const userProfileTitleResolver: ResolveFn<string> = (route) => {
  const userManagementService = inject(UserManagementService);
  const userId = route.paramMap.get('userId');

  return userManagementService
    .getUser(+(userId ?? 0))
    .pipe(map((user) => `${user.firstName} ${user.lastName}`));
};
