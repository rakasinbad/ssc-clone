import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentStatusComponent } from './payment-status.component';

const routes: Routes = [{ path: '', component: PaymentStatusComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentStatusRoutingModule { }
