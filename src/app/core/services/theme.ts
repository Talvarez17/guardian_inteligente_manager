import { Injectable, effect, signal } from '@angular/core';

export type ThemeName = 'pro' | 'pro-dark';

const STORAGE_KEY = 'guardian-theme';

@Injectable({ providedIn: 'root' })
export class Theme {
  readonly current = signal<ThemeName>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const value = this.current();
      document.body.dataset['theme'] = value;
      localStorage.setItem(STORAGE_KEY, value);
    });
  }

  toggle(): void {
    this.current.update((value) => (value === 'pro' ? 'pro-dark' : 'pro'));
  }

  private getInitialTheme(): ThemeName {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'pro' || stored === 'pro-dark') {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'pro-dark' : 'pro';
  }
}
