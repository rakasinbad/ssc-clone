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
import { fromCatalogue } from './store/reducers';
import { CataloguesImportComponent } from './catalogues-import/catalogues-import.component';
import { CataloguesAddNewProductComponent } from './catalogues-add-new-product/catalogues-add-new-product.component';
import { CataloguesFormComponent } from './catalogues-form/catalogues-form.component';

@NgModule({
  declarations: [CataloguesComponent, CataloguesImportComponent, CataloguesAddNewProductComponent, CataloguesFormComponent],
  imports: [
    CataloguesRoutingModule,

    SharedModule,
    MaterialModule,

    RxReactiveFormsModule,
    RxReactiveDynamicFormsModule,
    NgxPermissionsModule.forChild(),

    StoreModule.forFeature(fromCatalogue.FEATURE_KEY, fromCatalogue.reducer),
    EffectsModule.forFeature([])
  ],
  entryComponents: [CataloguesImportComponent]
})
export class CataloguesModule { }
