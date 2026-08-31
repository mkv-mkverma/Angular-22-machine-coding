import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './header/header/header';
import { Footer } from './footer/footer/footer';
import { GoogleAnalytics } from './core/analytics/google-analytics';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Angular-22-machine-coding');

  private router = inject(Router);
  private analytics = inject(GoogleAnalytics);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.analytics.pageView(event.urlAfterRedirects);
      });
  }

  // user$ = this.userService.getUsers().subscribe()
  // If used outside an injection context, you can provide DestroyRef:
  // user$ = this.userService.getuserCashed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

  // For observables used directly in the template,
  // I prefer AsyncPipe because Angular manages the subscription lifecycle automatically."
  // sub$ = this.userService.getUsers().subscribe();

  // constructor() {
  //   this.userService
  //     .getUsers()
  //     .pipe(takeUntilDestroyed())
  //     .subscribe((users) => {
  //       console.log(users);
  //     });
  // }

  // switchMap() can cancel previous HTTP requests

  // Some operators can naturally limit the subscription: take(1), first(), take(5)
  // Once the condition is satisfied, the observable completes and no manual unsubscribe is required.
  // this.route.params
  //   .pipe(take(1))
  //   .subscribe(params => {
  //     console.log(params);
  //   });

  // private subscription!: Subscription;

  // ngOnInit() {
  //   this.subscription = this.userService.getUsers().subscribe();
  // }

  // ngOnDestroy() {
  //   if (this.subscription) {
  //     this.subscription.unsubscribe();
  //   }
  // }
}
