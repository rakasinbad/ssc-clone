import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { QuillModule } from 'ngx-quill';

import { CataloguesRoutingModule } from './catalogues.routes';
import { CataloguesComponent } from './catalogues.component';
import { CataloguesImportComponent } from './catalogues-import/catalogues-import.component';
import { CataloguesAddNewProductComponent } from './catalogues-add-new-product/catalogues-add-new-product.component';
import { CataloguesFormComponent } from './catalogues-form/catalogues-form.component';
import { CataloguesSelectCategoryComponent } from './catalogues-select-category/catalogues-select-category.component';
import { CataloguesEditPriceStockComponent } from './catalogues-edit-price-stock/catalogues-edit-price-stock.component';
import { CataloguesRemoveComponent } from './catalogues-remove/catalogues-remove.component';

import { CatalogueEffects } from './store/effects';

import { fromCatalogue, fromBrand } from './store/reducers';
import { CataloguesActiveInactiveComponent } from './catalogues-active-inactive/catalogues-active-inactive.component';
import { BrandEffects } from './store/effects/brand.effects';
// import { style } from '@angular/animations';

@NgModule({
    declarations: [
        CataloguesComponent,
        CataloguesImportComponent,
        CataloguesAddNewProductComponent,
        CataloguesFormComponent,
        CataloguesSelectCategoryComponent,
        CataloguesEditPriceStockComponent,
        CataloguesRemoveComponent,
        CataloguesActiveInactiveComponent
    ],
    imports: [
        CataloguesRoutingModule,

        SharedModule,
        MaterialModule,

        RxReactiveFormsModule,
        // RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),
        QuillModule.forRoot({
            modules: {
                toolbar: [
                    ['bold'],
                    [{ list: 'ordered'}, { list: 'bullet' }],
                ]
            },
            placeholder: '',
        }),

        StoreModule.forFeature(fromCatalogue.FEATURE_KEY, fromCatalogue.reducer),
        StoreModule.forFeature(fromBrand.FEATURE_KEY, fromBrand.reducer),

        EffectsModule.forFeature([ BrandEffects, CatalogueEffects ])
    ],
    entryComponents: [
        CataloguesImportComponent,
        CataloguesAddNewProductComponent,
        CataloguesEditPriceStockComponent,
        CataloguesSelectCategoryComponent,
        CataloguesRemoveComponent,
        CataloguesActiveInactiveComponent
    ]
})
export class CataloguesModule { }
