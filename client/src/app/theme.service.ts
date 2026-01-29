import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'theme';
export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly theme = signal<Theme>(this.loadStored());

  readonly isDark = computed(() => this.theme() === 'dark');
  readonly isLight = computed(() => this.theme() === 'light');

  constructor() {
    this.apply(this.theme());
  }

  get(): Theme {
    return this.theme();
  }

  set(value: Theme): void {
    this.theme.set(value);
    this.persist(value);
    this.apply(value);
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private loadStored(): Theme {
    if (typeof localStorage === 'undefined') return 'dark';
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : 'dark';
  }

  private persist(value: Theme): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, value);
  }

  private apply(value: Theme): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', value);
  }
}
