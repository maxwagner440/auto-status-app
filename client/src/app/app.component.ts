import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SUPER_ADMIN_TOKEN_KEY } from './api.service';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  public showNav = signal(true);
  public showManageNav = signal(false);
  public shopKey = signal('');

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly router: Router,
    readonly theme: ThemeService,
  ) {
    this.applyNavState(this.router.url || window.location.pathname);
  }

  public ngOnInit(): void {
    const sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.applyNavState(e.urlAfterRedirects));
    this.subscriptions.add(sub);
  }

  private applyNavState(url: string): void {
    const isRoot = url === '/' || url === '';
    const isManage = url.startsWith('/manage');
    const isManageLogin = url === '/manage/login' || url.startsWith('/manage/login');
    const isStatus = url.match(/\/status\//);
    const isShopLogin = url.match(/\/login$/);

    this.showManageNav.set(isManage && !isManageLogin);
    this.showNav.set(
      !isRoot && !isManage && !isStatus && !isShopLogin,
    );

    if (!isRoot && !isManage) {
      const match = url.match(/^\/([^/]+)/);
      this.shopKey.set(match ? match[1] : '');
    } else {
      this.shopKey.set('');
    }
  }

  public logout(): void {
    const k = this.shopKey();
    if (k) localStorage.removeItem(`accessToken_${k}`);
    this.shopKey.set('');
    this.router.navigate([`/${k || 'default'}/login`]);
  }

  public manageLogout(): void {
    localStorage.removeItem(SUPER_ADMIN_TOKEN_KEY);
    this.router.navigate(['/manage/login']);
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
