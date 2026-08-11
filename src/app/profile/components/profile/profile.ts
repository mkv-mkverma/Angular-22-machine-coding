import { Component, inject } from '@angular/core';
import { ProfileService } from '../../services/profile-service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [AsyncPipe, CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  // ActivatedRoute.params gives you the route parameters from the current URL as Observable that emits route parameters whenever the route parameters change, allowing the component to react without being recreated.
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);

  user$ = this.route.paramMap.pipe(
    map((param) => param.get('id')),
    filter((id) => id !== null),
    map((e) => +e),
    distinctUntilChanged(),
    switchMap((id) => this.profileService.getCachedUser(id)),
  );
}
