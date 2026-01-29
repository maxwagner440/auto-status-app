import { Component, signal, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService, SUPER_ADMIN_TOKEN_KEY } from '../../api.service';

@Component({
  selector: 'app-manage-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './manage-login.component.html',
  styleUrl: './manage-login.component.scss',
})
export class ManageLoginComponent implements OnDestroy {
  username = '';
  password = '';
  message = signal('');
  loading = signal(false);

  private readonly subs = new Subscription();
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  constructor() {
    const token = localStorage.getItem(SUPER_ADMIN_TOKEN_KEY);
    if (token) {
      this.router.navigate(['/manage']);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  login(): void {
    if (!this.username.trim()) {
      this.message.set('Username is required.');
      return;
    }
    if (!this.password) {
      this.message.set('Password is required.');
      return;
    }
    this.loading.set(true);
    this.message.set('');
    const sub = this.api.manageLogin(this.username.trim(), this.password).subscribe({
      next: (res) => {
        localStorage.setItem(SUPER_ADMIN_TOKEN_KEY, res.accessToken);
        this.router.navigate(['/manage']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err?.status === 401) {
          this.message.set('Invalid username or password. Please try again.');
        } else {
          this.message.set('Error logging in. Please try again.');
        }
        console.error('Manage login error:', err);
      },
    });
    this.subs.add(sub);
  }
}
