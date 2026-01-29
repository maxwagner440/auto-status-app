import { HttpInterceptorFn } from '@angular/common/http';
import { SUPER_ADMIN_TOKEN_KEY } from './api.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Shop admin API: add Bearer from accessToken_<shopKey>
  if (req.url.startsWith('/api/admin/')) {
    const match = req.url.match(/^\/api\/admin\/([^/]+)/);
    if (match) {
      const shopKey = match[1];
      const token = localStorage.getItem(`accessToken_${shopKey}`);
      if (token) {
        return next(req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        }));
      }
    }
  }

  // Super-admin API (excluding login): add Bearer from superAdminAccessToken
  if (req.url.startsWith('/api/super-admin/') && !req.url.includes('/auth/login')) {
    const token = localStorage.getItem(SUPER_ADMIN_TOKEN_KEY);
    if (token) {
      return next(req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      }));
    }
  }

  return next(req);
};

