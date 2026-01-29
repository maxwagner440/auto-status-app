import { Injectable } from '@angular/core';

const COOKIE_NAME = 'lastShopId';
const MAX_AGE_YEARS = 1;

@Injectable({ providedIn: 'root' })
export class ShopIdCookieService {
  get(): string | null {
    if (typeof document === 'undefined' || !document.cookie) return null;
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
    const value = match ? decodeURIComponent(match[1].trim()) : null;
    return value || null;
  }

  set(shopId: string): void {
    if (typeof document === 'undefined') return;
    const maxAge = 60 * 60 * 24 * 365 * MAX_AGE_YEARS;
    const v = encodeURIComponent(shopId.trim().toLowerCase());
    document.cookie = `${COOKIE_NAME}=${v}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}
