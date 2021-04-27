import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { AuthGuard } from '../../core/auth/auth.guard';

import { MerchantSegmentationComponent } from './merchant-segmentation.component';

const routes: Routes = [
  {
    path: '',
    component: MerchantSegmentationComponent,
    canActivate: [AuthGuard, NgxPermissionsGuard],
    data: {
        permissions: {
            only: ['ACCOUNT.STORE.READ'],
            redirectTo: {
                navigationCommands: ['/pages/errors/403'],
                navigationExtras: {
                    replaceUrl: true,
                    skipLocationChange: true
                }
            }
        }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchantSegmentationRoutingModule { }
