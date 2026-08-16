import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Dashboard } from './dashboard';
import { ProfileService } from '../../profile/services/profile-service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
            snapshot: {
              data: {
                dashboardResolver: {
                  users: [{ id: 1 }],
                  permissions: [{ id: 1 }],
                  features: [{ id: 1 }],
                },
              },
            },
          },
        },
        {
          provide: ProfileService,
          useValue: { getCachedUser: () => of({ id: 1, firstName: 'Manish' }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes the resolved dashboard data and card list', () => {
    expect(component.dashboardData).toEqual({
      users: [{ id: 1 }],
      permissions: [{ id: 1 }],
      features: [{ id: 1 }],
    });
    expect(component.cards.length).toBeGreaterThan(0);
  });

  it('renders a card link for every dashboard entry', () => {
    const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('a.dashboard-card');
    expect(links.length).toBe(component.cards.length);
  });
});
