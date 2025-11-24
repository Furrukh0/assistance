import { Injectable, TemplateRef } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: any[] = [];

  show(textOrTpl: string | TemplateRef<any>, options: { type?: ToastType, delay?: number } = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  success(message: string, delay: number = 3000) {
    this.show(message, { type: 'success', delay });
  }

  error(message: string, delay: number = 3000) {
    this.show(message, { type: 'error', delay });
  }

  warning(message: string, delay: number = 3000) {
    this.show(message, { type: 'warning', delay });
  }

  info(message: string, delay: number = 3000) {
    this.show(message, { type: 'info', delay });
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}


