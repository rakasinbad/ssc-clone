import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssociationsRoutingModule } from './associations-routing.module';
import { AssociationsComponent } from './associations.component';


@NgModule({
  declarations: [AssociationsComponent],
  imports: [
    CommonModule,
    AssociationsRoutingModule
  ]
})
export class AssociationsModule { }
