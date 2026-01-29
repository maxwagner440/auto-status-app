import { Component, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService, PublicStatusResponse } from '../../api.service';

@Component({
  selector: 'app-customer-status',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './customer-status.component.html',
  styleUrl: './customer-status.component.scss'
})
export class CustomerStatusComponent implements OnDestroy {
  public data = signal<PublicStatusResponse | null>(null);
  public loading = signal(true);
  public error = signal(false);
  public verificationRequired = signal(false);
  public verificationCode = '';
  public verificationError = signal('');
  public shopKey = '';
  public token = '';

  private readonly subscriptions = new Subscription();
  private readonly route: ActivatedRoute;
  private readonly api: ApiService;

  constructor(
    route: ActivatedRoute,
    api: ApiService
  ) {
    this.route = route;
    this.api = api;
    this.shopKey = String(this.route.snapshot.paramMap.get('shopKey') || '');
    this.token = String(this.route.snapshot.paramMap.get('token') || '');
    
    if (!this.shopKey || !this.token) {
      this.loading.set(false);
      this.error.set(true);
      return;
    }

    this.loadStatus();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    } catch {
      return dateString;
    }
  }

  private loadStatus(verifyCode?: string): void {
    this.loading.set(true);
    this.error.set(false);
    this.verificationError.set('');
    
    const sub = this.api.publicStatus(this.shopKey, this.token, verifyCode).subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
        this.error.set(false);
        this.verificationRequired.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        
        // Check if verification is required
        if (err.status === 401 && err.error?.message === 'verification_required') {
          this.verificationRequired.set(true);
          this.error.set(false);
        } else if (err.status === 401 && err.error?.message === 'verification_failed') {
          this.verificationError.set('Invalid verification code. Please try again.');
          this.verificationRequired.set(true);
        } else {
          this.error.set(true);
          this.data.set(null);
        }
        console.error('Error loading status:', err);
      }
    });
    this.subscriptions.add(sub);
  }

  public submitVerification(): void {
    if (!this.verificationCode.trim() || this.verificationCode.trim().length !== 4) {
      this.verificationError.set('Please enter the last 4 digits of your phone number.');
      return;
    }

    if (!/^\d{4}$/.test(this.verificationCode.trim())) {
      this.verificationError.set('Verification code must be 4 digits.');
      return;
    }

    this.loadStatus(this.verificationCode.trim());
  }
}

