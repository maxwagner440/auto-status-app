import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';

export const AdminAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const shopKey = route.paramMap.get('shopKey');

  if (!shopKey) {
    router.navigate(['/default/login']);
    return false;
  }

  // Check if token exists for this shopKey
  const token = localStorage.getItem(`accessToken_${shopKey}`);
  
  if (!token) {
    router.navigate([`/${shopKey}/login`]);
    return false;
  }

  return true;
};

