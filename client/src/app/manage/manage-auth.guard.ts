import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SUPER_ADMIN_TOKEN_KEY } from '../api.service';

export const ManageAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem(SUPER_ADMIN_TOKEN_KEY);

  if (!token) {
    router.navigate(['/manage/login']);
    return false;
  }

  return true;
};
