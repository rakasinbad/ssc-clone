import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { CataloguesRoutingModule } from './catalogues-routing.module';
import { CataloguesComponent } from './catalogues.component';
import { CataloguesImportComponent } from './catalogues-import/catalogues-import.component';
import { CataloguesAddNewProductComponent } from './catalogues-add-new-product/catalogues-add-new-product.component';
import { CataloguesFormComponent } from './catalogues-form/catalogues-form.component';
import { CataloguesBlockComponent } from './catalogues-block/catalogues-block.component';
import { CataloguesRemoveComponent } from './catalogues-remove/catalogues-remove.component';

import { CatalogueEffects } from './store/effects';
import { fromCatalogue } from './store/reducers';
import { CataloguesActiveInactiveComponent } from './catalogues-active-inactive/catalogues-active-inactive.component';

@NgModule({
  declarations: [
      CataloguesComponent,
      CataloguesImportComponent,
      CataloguesAddNewProductComponent,
      CataloguesFormComponent,
      CataloguesBlockComponent,
      CataloguesRemoveComponent,
      CataloguesActiveInactiveComponent
  ],
  imports: [
    CataloguesRoutingModule,

    SharedModule,
    MaterialModule,

    RxReactiveFormsModule,
    RxReactiveDynamicFormsModule,
    NgxPermissionsModule.forChild(),

    StoreModule.forFeature(fromCatalogue.FEATURE_KEY, fromCatalogue.reducer),
    EffectsModule.forFeature([CatalogueEffects])
  ],
  entryComponents: [
    CataloguesImportComponent,
    CataloguesAddNewProductComponent,
    CataloguesBlockComponent,
    CataloguesRemoveComponent,
    CataloguesActiveInactiveComponent
  ]
})
export class CataloguesModule { }
