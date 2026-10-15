import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models';

const USER_KEY = 'currentUser'; // same key AuthService uses

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly current = signal<User | null>(this.restore());

  readonly user = this.current.asReadonly();

  readonly fullName = computed(() => {
    const u = this.current();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });

  setUser(user: User | null): void {
    this.current.set(user);
    if (!this.isBrowser) return;
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    } catch {
      /* storage unavailable: keep going in memory */
    }
  }

  private restore(): User | null {
    if (!this.isBrowser) return null; // the server has no browser storage
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}