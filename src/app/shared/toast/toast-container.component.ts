import { Component, TemplateRef } from '@angular/core';
import { ToastService } from 'src/app/core/services/toast.service';


@Component({
    selector: 'app-toasts',
    template: `
   @for(toast of toastService.toasts;track $index){
    <ngb-toast
           [class]="getToastClass(toast.type)"
      [autohide]="true"
      [delay]="toast.delay || 3000"
      (hidden)="toastService.remove(toast)"
    >
      <ng-template [ngIf]="isTemplate(toast)" [ngIfElse]="text">
        <ng-template [ngTemplateOutlet]="toast.textOrTpl"></ng-template>
      </ng-template>

      <ng-template #text>{{ toast.textOrTpl }}</ng-template>
    </ngb-toast>
   }
  `,
    host: { 'class': 'toast-container position-fixed top-0 end-0 p-3', 'style': 'z-index: 1200' },
    standalone: false
})
export class ToastsContainer {
  constructor(public toastService: ToastService) { }

  isTemplate(toast: { textOrTpl: any; }) { return toast.textOrTpl instanceof TemplateRef; }

  getToastClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-success text-light';
      case 'error':
        return 'bg-danger text-light';
      case 'warning':
        return 'bg-warning text-dark';
      case 'info':
        return 'bg-info text-dark';
      default:
        return 'bg-secondary text-light';
    }
  }
}
