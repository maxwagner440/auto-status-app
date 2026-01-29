import { Component, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ShopIdCookieService } from '../shop-id-cookie.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  public shopKey = '';
  public error = signal('');

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cookie: ShopIdCookieService,
  ) {}

  ngOnInit(): void {
    const changing = this.route.snapshot.queryParamMap.get('change') === '1';
    const cached = this.cookie.get();

    if (changing) {
      this.shopKey = cached ?? '';
      return;
    }

    if (cached && this.validateShopKey(cached)) {
      this.router.navigate([`/${cached}/login`], { replaceUrl: true });
    } else if (cached) {
      this.shopKey = cached;
    }
  }

  validateShopKey(shopKey: string): boolean {
    return /^[a-z0-9-]+$/.test(shopKey);
  }

  continue(): void {
    const trimmed = this.shopKey.trim().toLowerCase();

    if (!trimmed) {
      this.error.set('Shop ID is required.');
      return;
    }

    if (!this.validateShopKey(trimmed)) {
      this.error.set('Shop ID can only contain lowercase letters, numbers, and hyphens.');
      return;
    }

    this.cookie.set(trimmed);
    this.router.navigate([`/${trimmed}/login`]);
  }
}

