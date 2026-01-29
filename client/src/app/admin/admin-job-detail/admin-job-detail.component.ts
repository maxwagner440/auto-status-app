import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService, Job, MetaState, MetaFlag } from '../../api.service';

@Component({
  selector: 'app-admin-job-detail',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-job-detail.component.html',
  styleUrl: './admin-job-detail.component.scss'
})
export class AdminJobDetailComponent implements OnDestroy {
  public job = signal<Job | null>(null);
  public states = signal<MetaState[]>([]);
  public flags = signal<MetaFlag[]>([]);
  public message = signal('');
  public stateKey = signal('');
  public flagKey = signal('');
  public originalStateKey = signal('');
  public originalFlagKey = signal('');
  public showCloseConfirm = signal(false);
  public showReactivateConfirm = signal(false);

  public isClosed = computed(() => {
    const j = this.job();
    return j ? !j.active : false;
  });

  public customerHref = computed(() => {
    const j = this.job();
    return j ? `${window.location.origin}/${this.shopKey}/status/${j.token}` : '';
  });

  public hasChanges = computed(() => {
    const j = this.job();
    if (!j || !j.active) return false; // No changes allowed if inactive
    return this.stateKey() !== this.originalStateKey() || this.flagKey() !== this.originalFlagKey();
  });

  public selectedStateBlurb = computed(() => {
    const key = this.stateKey();
    const statesList = this.states();
    if (!key || statesList.length === 0) return '';
    const s = statesList.find(x => x.key === key);
    return s?.customerBlurb ?? '';
  });

  public selectedFlagBlurb = computed(() => {
    const key = this.flagKey();
    const flagsList = this.flags();
    if (!key || flagsList.length === 0) return '';
    const f = flagsList.find(x => x.key === key);
    return f?.customerBlurb ?? '';
  });

  private readonly subscriptions = new Subscription();
  private readonly route: ActivatedRoute;
  private readonly api: ApiService;
  private shopKey = '';
  private id = '';

  constructor(
    route: ActivatedRoute,
    api: ApiService
  ) {
    this.route = route;
    this.api = api;
    this.shopKey = String(this.route.snapshot.paramMap.get('shopKey') || 'default');
    this.id = String(this.route.snapshot.paramMap.get('id') || '');
    
    if (!this.id) {
      this.message.set('Invalid job ID.');
      return;
    }

    this.loadMeta();
    this.reload();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public reload(): void {
    this.message.set('');
    const sub = this.api.getJob(this.shopKey, this.id).subscribe({
      next: (j) => {
        this.job.set(j);
        this.stateKey.set(j.stateKey);
        this.flagKey.set(j.flagKey);
        this.originalStateKey.set(j.stateKey);
        this.originalFlagKey.set(j.flagKey);
      },
      error: (err) => {
        this.message.set('Error loading job.');
        console.error('Error loading job:', err);
      }
    });
    this.subscriptions.add(sub);
  }

  public save(): void {
    if (!this.hasChanges()) {
      return;
    }

    const j = this.job();
    if (j && !j.active) {
      this.message.set('Cannot save changes to an inactive job. Please reactivate it first.');
      return;
    }

    this.message.set('Saving...');
    const sub = this.api.updateJob(this.shopKey, this.id, { stateKey: this.stateKey(), flagKey: this.flagKey() }).subscribe({
      next: () => {
        this.message.set('Saved.');
        this.reload();
      },
      error: (err) => {
        this.message.set('Error saving.');
        console.error('Error saving job:', err);
      }
    });
    this.subscriptions.add(sub);
  }

  public async copyCustomerLink(): Promise<void> {
    const url = this.customerHref();
    try {
      await navigator.clipboard.writeText(url);
      this.message.set('Link copied to clipboard!');
      setTimeout(() => this.message.set(''), 3000);
    } catch (err) {
      this.message.set('Failed to copy link. Please copy manually.');
      console.error('Failed to copy:', err);
    }
  }

  public confirmCloseJob(): void {
    this.showCloseConfirm.set(true);
  }

  public cancelCloseJob(): void {
    this.showCloseConfirm.set(false);
  }

  public closeJob(): void {
    this.showCloseConfirm.set(false);
    this.message.set('Closing...');
    const sub = this.api.updateJob(this.shopKey, this.id, { active: false }).subscribe({
      next: () => {
        this.message.set('Closed.');
        this.reload();
      },
      error: (err) => {
        this.message.set('Error closing job.');
        console.error('Error closing job:', err);
      }
    });
    this.subscriptions.add(sub);
  }

  public confirmReactivateJob(): void {
    this.showReactivateConfirm.set(true);
  }

  public cancelReactivateJob(): void {
    this.showReactivateConfirm.set(false);
  }

  public reactivateJob(): void {
    this.showReactivateConfirm.set(false);
    this.message.set('Reactivating...');
    const sub = this.api.reactivateJob(this.shopKey, this.id).subscribe({
      next: () => {
        this.message.set('Job reactivated.');
        this.reload();
      },
      error: (err) => {
        this.message.set('Error reactivating job.');
        console.error('Error reactivating job:', err);
      }
    });
    this.subscriptions.add(sub);
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

  private loadMeta(): void {
    const sub = this.api.meta().subscribe({
      next: (meta) => {
        this.states.set(meta.states);
        this.flags.set(meta.flags);
      },
      error: (err) => {
        this.message.set('Error loading job options.');
        console.error('Error loading meta:', err);
      }
    });
    this.subscriptions.add(sub);
  }
}

