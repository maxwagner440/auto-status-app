import { Routes } from '@angular/router';
import { AdminShopComponent } from './admin/admin-shop/admin-shop.component';
import { AdminJobsComponent } from './admin/admin-jobs/admin-jobs.component';
import { AdminJobDetailComponent } from './admin/admin-job-detail/admin-job-detail.component';
import { CustomerStatusComponent } from './customer/customer-status/customer-status.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { LandingComponent } from './landing/landing.component';
import { AdminAuthGuard } from './admin/admin-auth.guard';
import { ManageLoginComponent } from './manage/manage-login/manage-login.component';
import { ManageShopsComponent } from './manage/manage-shops/manage-shops.component';
import { ManageShopEditComponent } from './manage/manage-shop-edit/manage-shop-edit.component';
import { ManageAuthGuard } from './manage/manage-auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: LandingComponent },
  { path: 'manage/login', component: ManageLoginComponent },
  { path: 'manage/shops', pathMatch: 'full', redirectTo: 'manage' },
  {
    path: 'manage',
    component: ManageShopsComponent,
    canActivate: [ManageAuthGuard],
  },
  {
    path: 'manage/shops/:id',
    component: ManageShopEditComponent,
    canActivate: [ManageAuthGuard],
  },
  {
    path: ':shopKey/login',
    component: AdminLoginComponent,
  },
  {
    path: ':shopKey/admin',
    component: AdminShopComponent,
    canActivate: [AdminAuthGuard],
  },
  {
    path: ':shopKey/admin/jobs',
    component: AdminJobsComponent,
    canActivate: [AdminAuthGuard],
  },
  {
    path: ':shopKey/admin/jobs/:id',
    component: AdminJobDetailComponent,
    canActivate: [AdminAuthGuard],
  },
  {
    path: ':shopKey/status/:token',
    component: CustomerStatusComponent,
  },
  { path: '**', redirectTo: '' },
];
