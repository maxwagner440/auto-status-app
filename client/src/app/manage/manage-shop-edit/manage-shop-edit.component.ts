import { Component, signal, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService, ManageShop } from '../../api.service';

@Component({
  selector: 'app-manage-shop-edit',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './manage-shop-edit.component.html',
  styleUrl: './manage-shop-edit.component.scss',
})
export class ManageShopEditComponent implements OnDestroy {
  shop = signal<ManageShop | null>(null);
  loading = signal(true);
  saving = signal(false);
  message = signal('');
  error = signal<string | null>(null);

  name = '';
  phone = '';
  hours = '';
  primaryContactName = '';
  requiresVerification = false;

  private readonly subs = new Subscription();
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/manage']);
      return;
    }
    this.load(id);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    const sub = this.api.getManageShop(id).subscribe({
      next: (s) => {
        this.shop.set(s);
        this.name = s.name;
        this.phone = s.phone;
        this.hours = s.hours;
        this.primaryContactName = s.primaryContactName ?? '';
        this.requiresVerification = s.requiresVerification;
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load shop.');
        this.loading.set(false);
        this.shop.set(null);
        console.error('Get shop error:', err);
      },
    });
    this.subs.add(sub);
  }

  save(): void {
    const s = this.shop();
    if (!s || s.deletedAt) return;
    this.saving.set(true);
    this.message.set('');
    const payload = {
      name: this.name.trim(),
      phone: this.phone.trim(),
      hours: this.hours.trim(),
      primaryContactName: this.primaryContactName.trim() || null,
      requiresVerification: this.requiresVerification,
    };
    const sub = this.api.updateManageShop(s.id, payload).subscribe({
      next: (updated) => {
        this.shop.set(updated);
        this.saving.set(false);
        this.message.set('Saved.');
      },
      error: (err) => {
        this.saving.set(false);
        this.message.set(err?.error?.message ?? 'Error saving.');
        console.error('Update shop error:', err);
      },
    });
    this.subs.add(sub);
  }

  restore(): void {
    const s = this.shop();
    if (!s || !s.deletedAt) return;
    this.message.set('');
    this.subs.add(
      this.api.restoreManageShop(s.id).subscribe({
        next: (updated) => {
          this.shop.set(updated);
          this.name = updated.name;
          this.phone = updated.phone;
          this.hours = updated.hours;
          this.primaryContactName = updated.primaryContactName ?? '';
          this.requiresVerification = updated.requiresVerification;
          this.message.set('Shop restored.');
        },
        error: (err) => {
          this.message.set(err?.error?.message ?? 'Error restoring.');
          console.error('Restore error:', err);
        },
      }),
    );
  }
}
