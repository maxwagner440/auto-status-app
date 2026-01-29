import {
  Component,
  signal,
  computed,
  OnDestroy,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService, ManageShop } from '../../api.service';

@Component({
  selector: 'app-manage-shops',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './manage-shops.component.html',
  styleUrl: './manage-shops.component.scss',
})
export class ManageShopsComponent implements OnDestroy {
  shops = signal<ManageShop[]>([]);
  loading = signal(false);
  message = signal('');
  error = signal<string | null>(null);

  createName = '';
  createPhone = '';
  createHours = '';
  createPrimaryContact = '';
  createPassword = '';
  createShopKey = '';
  createRequiresVerification = false;
  createErrors = signal<{ name?: string; phone?: string; hours?: string; password?: string }>({});
  creating = signal(false);

  searchQuery = '';
  filteredShops = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const list = this.shops();
    if (!q) return list;
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shopKey.toLowerCase().includes(q) ||
        (s.phone || '').toLowerCase().includes(q),
    );
  });

  private readonly subs = new Subscription();
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  constructor() {
    this.reload();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    const sub = this.api.listManageShops().subscribe({
      next: (list) => {
        this.shops.set(list ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load shops. Please try again.');
        this.loading.set(false);
        this.shops.set([]);
        console.error('List shops error:', err);
      },
    });
    this.subs.add(sub);
  }

  validateCreate(): boolean {
    const e: { name?: string; phone?: string; hours?: string; password?: string } = {};
    if (!this.createName.trim()) e.name = 'Name is required.';
    if (!this.createPhone.trim()) e.phone = 'Phone is required.';
    if (!this.createHours.trim()) e.hours = 'Hours are required.';
    if (!this.createPassword) e.password = 'Password is required.';
    this.createErrors.set(e);
    return Object.keys(e).length === 0;
  }

  create(): void {
    if (!this.validateCreate()) return;
    this.creating.set(true);
    this.message.set('');
    const payload = {
      name: this.createName.trim(),
      phone: this.createPhone.trim(),
      hours: this.createHours.trim(),
      primaryContactName: this.createPrimaryContact.trim() || null,
      password: this.createPassword,
      shopKey: this.createShopKey.trim() || undefined,
      requiresVerification: this.createRequiresVerification,
    };
    const sub = this.api.createManageShop(payload).subscribe({
      next: () => {
        this.creating.set(false);
        this.createName = '';
        this.createPhone = '';
        this.createHours = '';
        this.createPrimaryContact = '';
        this.createPassword = '';
        this.createShopKey = '';
        this.createRequiresVerification = false;
        this.createErrors.set({});
        this.message.set('Shop created.');
        this.reload();
      },
      error: (err) => {
        this.creating.set(false);
        this.message.set(err?.error?.message ?? 'Error creating shop.');
        console.error('Create shop error:', err);
      },
    });
    this.subs.add(sub);
  }

  softDelete(shop: ManageShop): void {
    if (shop.deletedAt) return;
    if (!confirm(`Soft-delete "${shop.name}"? Shop and jobs will be hidden from customers and shop login.`)) {
      return;
    }
    this.message.set('');
    this.subs.add(
      this.api.softDeleteManageShop(shop.id).subscribe({
        next: () => {
          this.message.set('Shop soft-deleted.');
          this.reload();
        },
        error: (err) => {
          this.message.set(err?.error?.message ?? 'Error soft-deleting shop.');
          console.error('Soft-delete error:', err);
        },
      }),
    );
  }

  restore(shop: ManageShop): void {
    if (!shop.deletedAt) return;
    this.message.set('');
    this.subs.add(
      this.api.restoreManageShop(shop.id).subscribe({
        next: () => {
          this.message.set('Shop restored.');
          this.reload();
        },
        error: (err) => {
          this.message.set(err?.error?.message ?? 'Error restoring shop.');
          console.error('Restore error:', err);
        },
      }),
    );
  }

  formatDate(s: string | undefined): string {
    if (!s) return '—';
    try {
      return new Date(s).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return String(s);
    }
  }
}
