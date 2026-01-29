import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Shop = { name: string; phone: string; hours: string; primaryContactName: string; requiresVerification?: boolean; };
export type MetaState = { key: string; label: string; customerBlurb: string; };
export type MetaFlag = { key: string; label: string; customerBlurb: string; };

export type Job = {
  id: string;
  token: string;
  customerContact: string;
  vehicleLabel: string;
  stateKey: string;
  flagKey: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
};

export type PublicStatusResponse = {
  shop: Shop;
  job: {
    token: string;
    vehicleLabel: string;
    stateKey: string;
    stateLabel: string;
    stateCustomerBlurb: string;
    flagKey: string;
    flagLabel: string;
    flagCustomerBlurb: string;
    updatedAt: string;
    active: boolean;
  };
};

export type HealthResponse = {
  ok: boolean;
};

export type LoginResponse = {
  accessToken: string;
};

export type ManageShop = {
  id: string;
  shopKey: string;
  name: string;
  phone: string;
  hours: string;
  primaryContactName: string | null;
  requiresVerification: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export const SUPER_ADMIN_TOKEN_KEY = 'superAdminAccessToken';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  private getAuthToken(shopKey: string): string | null {
    return localStorage.getItem(`accessToken_${shopKey}`);
  }

  login(shopKey: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`/api/auth/${shopKey}/login`, { password });
  }

  manageLogin(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/super-admin/auth/login', { username, password });
  }

  listManageShops(): Observable<ManageShop[]> {
    return this.http.get<ManageShop[]>('/api/super-admin/shops');
  }

  getManageShop(id: string): Observable<ManageShop> {
    return this.http.get<ManageShop>(`/api/super-admin/shops/${id}`);
  }

  createManageShop(payload: {
    name: string;
    phone: string;
    hours: string;
    primaryContactName?: string | null;
    password: string;
    shopKey?: string;
    requiresVerification?: boolean;
  }): Observable<ManageShop> {
    return this.http.post<ManageShop>('/api/super-admin/shops', payload);
  }

  updateManageShop(id: string, payload: Partial<{
    name: string;
    phone: string;
    hours: string;
    primaryContactName: string | null;
    requiresVerification: boolean;
  }>): Observable<ManageShop> {
    return this.http.put<ManageShop>(`/api/super-admin/shops/${id}`, payload);
  }

  softDeleteManageShop(id: string): Observable<{ deleted: true }> {
    return this.http.delete<{ deleted: true }>(`/api/super-admin/shops/${id}`);
  }

  restoreManageShop(id: string): Observable<ManageShop> {
    return this.http.post<ManageShop>(`/api/super-admin/shops/${id}/restore`, {});
  }

  health(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>('/api/health');
  }

  getShop(shopKey: string): Observable<Shop> {
    // Token will be added by interceptor
    return this.http.get<Shop>(`/api/admin/${shopKey}/shop`);
  }

  updateShop(shopKey: string, payload: Partial<Shop>): Observable<Shop> {
    // Token will be added by interceptor
    return this.http.put<Shop>(`/api/admin/${shopKey}/shop`, payload);
  }

  meta(): Observable<{ states: MetaState[]; flags: MetaFlag[] }> {
    return this.http.get<{ states: MetaState[]; flags: MetaFlag[] }>('/api/meta');
  }

  listJobs(shopKey: string): Observable<Job[]> {
    // Token will be added by interceptor
    return this.http.get<Job[]>(`/api/admin/${shopKey}/jobs`);
  }

  createJob(shopKey: string, payload: { customerContact: string; vehicleLabel: string }): Observable<Job> {
    // Token will be added by interceptor
    return this.http.post<Job>(`/api/admin/${shopKey}/jobs`, payload);
  }

  getJob(shopKey: string, id: string): Observable<Job> {
    // Token will be added by interceptor
    return this.http.get<Job>(`/api/admin/${shopKey}/jobs/${id}`);
  }

  updateJob(shopKey: string, id: string, payload: Partial<{ stateKey: string; flagKey: string; active: boolean }>): Observable<Job> {
    // Token will be added by interceptor
    return this.http.put<Job>(`/api/admin/${shopKey}/jobs/${id}`, payload);
  }

  reactivateJob(shopKey: string, id: string): Observable<Job> {
    // Token will be added by interceptor
    return this.http.put<Job>(`/api/admin/${shopKey}/jobs/${id}`, { active: true });
  }

  publicStatus(shopKey: string, token: string, verify?: string): Observable<PublicStatusResponse> {
    let url = `/api/public/${shopKey}/status/${token}`;
    if (verify) {
      url += `?verify=${verify}`;
    }
    return this.http.get<PublicStatusResponse>(url);
  }
}
