import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService, Job } from '../../api.service';

@Component({
  selector: 'app-admin-jobs',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-jobs.component.html',
  styleUrl: './admin-jobs.component.scss'
})
export class AdminJobsComponent implements OnDestroy {
  public vehicleLabel = '';
  public customerContact = '';
  public searchQuery = '';
  public jobs = signal<Job[]>([]);
  public message = signal('');
  public loading = signal(false);
  public error = signal<string | null>(null);
  public createdJobToken = signal<string | null>(null);
  public vehicleLabelError = signal('');
  public customerContactError = signal('');

  public filteredJobs = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return this.jobs();
    
    return this.jobs().filter(job => 
      job.vehicleLabel.toLowerCase().includes(query) ||
      job.customerContact.toLowerCase().includes(query) ||
      job.stateKey.toLowerCase().includes(query) ||
      job.flagKey.toLowerCase().includes(query)
    );
  });

  public shopKey = '';

  private readonly subscriptions = new Subscription();
  private readonly route: ActivatedRoute;
  private readonly api: ApiService;

  constructor(
    route: ActivatedRoute,
    api: ApiService
  ) {
    this.route = route;
    this.api = api;
    this.shopKey = String(this.route.snapshot.paramMap.get('shopKey') || 'default');
    this.reload();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public reload(): void {
    this.loading.set(true);
    this.error.set(null);
    
    const sub = this.api.listJobs(this.shopKey).subscribe({
      next: (jobs) => {
        this.jobs.set(jobs || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load jobs. Please try again.');
        this.loading.set(false);
        this.jobs.set([]);
        console.error('Error loading jobs:', err);
      }
    });
    this.subscriptions.add(sub);
  }

  public validateForm(): boolean {
    let isValid = true;
    this.vehicleLabelError.set('');
    this.customerContactError.set('');

    if (!this.vehicleLabel.trim()) {
      this.vehicleLabelError.set('Vehicle label is required.');
      isValid = false;
    }

    if (!this.customerContact.trim()) {
      this.customerContactError.set('Customer contact is required.');
      isValid = false;
    }

    return isValid;
  }

  public create(): void {
    if (!this.validateForm()) {
      return;
    }

    this.message.set('Creating...');
    this.createdJobToken.set(null);
    
    const sub = this.api.createJob(this.shopKey, { 
      vehicleLabel: this.vehicleLabel.trim(), 
      customerContact: this.customerContact.trim() 
    }).subscribe({
      next: (job) => {
        this.vehicleLabel = '';
        this.customerContact = '';
        this.vehicleLabelError.set('');
        this.customerContactError.set('');
        this.message.set('Job created successfully!');
        this.createdJobToken.set(job.token);
        this.reload();
      },
      error: (e) => {
        this.message.set(e?.error?.error ?? 'Error creating job.');
        this.createdJobToken.set(null);
      }
    });
    this.subscriptions.add(sub);
  }

  public getCustomerUrl(token: string): string {
    return `${window.location.origin}/${this.shopKey}/status/${token}`;
  }

  public async copyCustomerLink(token: string): Promise<void> {
    const url = this.getCustomerUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      this.message.set('Link copied to clipboard!');
      setTimeout(() => this.message.set(''), 3000);
    } catch (err) {
      this.message.set('Failed to copy link. Please copy manually.');
      console.error('Failed to copy:', err);
    }
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
}

