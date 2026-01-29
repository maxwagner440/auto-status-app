import { Component, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '../../api.service';
import { ShopIdCookieService } from '../../shop-id-cookie.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent implements OnDestroy {
  public password = '';
  public message = signal('');
  public loading = signal(false);
  public shopKey = '';

  private readonly subscriptions = new Subscription();
  private readonly route: ActivatedRoute;
  private readonly router: Router;
  private readonly api: ApiService;
  private readonly cookie: ShopIdCookieService;

  constructor(
    route: ActivatedRoute,
    router: Router,
    api: ApiService,
    cookie: ShopIdCookieService,
  ) {
    this.route = route;
    this.router = router;
    this.api = api;
    this.cookie = cookie;

    this.shopKey = String(this.route.snapshot.paramMap.get('shopKey') || '');

    if (!this.shopKey) {
      this.message.set('Invalid shop key.');
      return;
    }

    const token = localStorage.getItem(`accessToken_${this.shopKey}`);
    if (token) {
      this.cookie.set(this.shopKey);
      this.router.navigate([`/${this.shopKey}/admin`]);
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public login(): void {
    if (!this.password.trim()) {
      this.message.set('Password is required.');
      return;
    }

    this.loading.set(true);
    this.message.set('');

    const sub = this.api.login(this.shopKey, this.password.trim()).subscribe({
      next: (response) => {
        localStorage.setItem(`accessToken_${this.shopKey}`, response.accessToken);
        this.cookie.set(this.shopKey);
        this.router.navigate([`/${this.shopKey}/admin`]);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.message.set('Invalid password. Please try again.');
        } else {
          this.message.set('Error logging in. Please try again.');
        }
        console.error('Error logging in:', err);
      }
    });
    this.subscriptions.add(sub);
  }
}

