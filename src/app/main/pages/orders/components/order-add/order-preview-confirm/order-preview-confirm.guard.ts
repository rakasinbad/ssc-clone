import { CanDeactivate } from '@angular/router';
import { OrderPreviewConfirmComponent } from './order-preview-confirm.component';

export class OrderPreviewConfirmComponentGuard implements CanDeactivate<OrderPreviewConfirmComponent> {

  canDeactivate(component: OrderPreviewConfirmComponent) {
    return component.canDeactivate();
  }
}