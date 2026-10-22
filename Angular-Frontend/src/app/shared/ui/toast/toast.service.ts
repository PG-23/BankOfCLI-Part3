import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type ToastTone = 'info' | 'success' | 'error' | 'warning';

export interface ToastMessage {
  id: number;
  tone: ToastTone;
  title: string;
  detail?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly messages = signal<ToastMessage[]>([]);

  show(title: string, options?: { tone?: ToastTone; detail?: string; durationMs?: number }): void {
    const toast: ToastMessage = {
      id: this.nextId++,
      tone: options?.tone ?? 'info',
      title,
      detail: options?.detail,
    };
    this.messages.update((list) => [...list, toast]);
    const duration = options?.durationMs ?? 3500;
    if (this.isBrowser) {
      window.setTimeout(() => this.dismiss(toast.id), duration);
    }
  }

  dismiss(id: number): void {
    this.messages.update((list) => list.filter((item) => item.id !== id));
  }
}
