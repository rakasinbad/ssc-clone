import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

import { CollectionRoutingModule } from './collection-routing.module';

import { CollectionComponent } from './collection.component';
import { DetailCollectionComponent } from './components/detail-collection/detail-collection.component';
import { ListCollectionComponent } from './components/list-collection/list-collection.component';

@NgModule({
  declarations: [
    CollectionComponent, 
    DetailCollectionComponent, 
    ListCollectionComponent],
    
  imports: [
    CommonModule,
    CollectionRoutingModule,

    SharedModule,
    MaterialModule,
    SharedComponentsModule,
    RxReactiveFormsModule,
    NgxPermissionsModule.forChild(),

  ]
})
export class CollectionModule { }
