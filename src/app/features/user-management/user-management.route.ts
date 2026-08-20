import { Routes } from '@angular/router';
import { UserProfile } from './user-profile/user-profile';
import { AddUser } from './add-user/add-user';
import { userProfileTitleResolver } from './user-profile/user-profile-title.resolver';

export const routes: Routes = [
  {
    path: ':userId',
    component: UserProfile,
    title: userProfileTitleResolver,
    children: [
      {
        path: 'add',
        component: AddUser,
        title: 'Add User',
      },
    ],
  },
];
