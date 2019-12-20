import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRepsRoutingModule } from './sales-reps-routing.module';
import { SalesRepsComponent } from './sales-reps.component';


@NgModule({
  declarations: [SalesRepsComponent],
  imports: [
    CommonModule,
    SalesRepsRoutingModule
  ]
})
export class SalesRepsModule { }
