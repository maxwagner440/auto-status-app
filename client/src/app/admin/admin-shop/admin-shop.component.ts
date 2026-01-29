import { Component, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService, Shop } from '../../api.service';

@Component({
  selector: 'app-admin-shop',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-shop.component.html',
  styleUrl: './admin-shop.component.scss'
})
export class AdminShopComponent implements OnDestroy {
  public model = signal<Shop>({ name: '', phone: '', hours: '', primaryContactName: '' });
  public message = signal('');

  private readonly subscriptions = new Subscription();
  private readonly route: ActivatedRoute;
  private readonly api: ApiService;
  private shopKey = '';

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
    this.message.set('');
    const sub = this.api.getShop(this.shopKey).subscribe({
      next: (shop) => this.model.set(shop),
      error: (err) => {
        this.message.set('Error loading shop settings.');
        console.error('Error loading shop:', err);
      }
    });
    this.subscriptions.add(sub);
  }

  public save(): void {
    this.message.set('Saving...');
    const sub = this.api.updateShop(this.shopKey, this.model()).subscribe({
      next: () => this.message.set('Saved.'),
      error: (err) => {
        this.message.set('Error saving.');
        console.error('Error saving shop:', err);
      }
    });
    this.subscriptions.add(sub);
  }
}

