import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MerchantSegmentationComponent } from './merchant-segmentation.component';

const routes: Routes = [{ path: '', component: MerchantSegmentationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchantSegmentationRoutingModule { }
