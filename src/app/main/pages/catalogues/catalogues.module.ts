import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { PipeSharedModule } from 'app/shared';
import { ExportsEffects } from 'app/shared/components/exports/store/effects';
import { fromExport } from 'app/shared/components/exports/store/reducers';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { environment } from 'environments/environment';
import { NgxPermissionsModule } from 'ngx-permissions';
import { QuillModule } from 'ngx-quill';
import { CataloguesActiveInactiveComponent } from './catalogues-active-inactive/catalogues-active-inactive.component';
import { CataloguesAddNewProductComponent } from './catalogues-add-new-product/catalogues-add-new-product.component';
import { CataloguesEditPriceStockComponent } from './catalogues-edit-price-stock/catalogues-edit-price-stock.component';
import { CataloguesFormComponent } from './catalogues-form/catalogues-form.component';
import { CataloguesImportComponent } from './catalogues-import/catalogues-import.component';
import { CataloguesRemoveComponent } from './catalogues-remove/catalogues-remove.component';
import { CataloguesSelectCategoryComponent } from './catalogues-select-category/catalogues-select-category.component';
import { CataloguesComponent } from './catalogues.component';
import { CataloguesRoutingModule } from './catalogues.routes';
import { CatalogueVisibilityComponent } from './components';
import { CatalogueAmountSettingsComponent } from './components/catalogue-amount-settings/catalogue-amount-settings.component';
import { CatalogueMediaSettingsComponent } from './components/catalogue-media-settings/catalogue-media-settings.component';
import { CataloguePriceSettingsComponent } from './components/catalogue-price-settings/catalogue-price-settings.component';
import { CatalogueSkuInformationComponent } from './components/catalogue-sku-information/catalogue-sku-information.component';
import { CatalogueWeightAndDimensionComponent } from './components/catalogue-weight-and-dimension/catalogue-weight-and-dimension.component';
import { CatalogueDetailComponent } from './pages/catalogue-detail/catalogue-detail.component';
import {
    BrandFacadeService,
    CatalogueFacadeService,
    CataloguePriceSegmentationApiService,
} from './services';
import { CatalogueEffects, DeletePriceSegmentationEffects } from './store/effects';
import { BrandEffects } from './store/effects/brand.effects';
import { fromBrand, fromCatalogue } from './store/reducers';

@NgModule({
    declarations: [
        CataloguesActiveInactiveComponent,
        CataloguesAddNewProductComponent,
        CataloguesComponent,
        CataloguesEditPriceStockComponent,
        CataloguesFormComponent,
        CataloguesImportComponent,
        CataloguesRemoveComponent,
        CataloguesSelectCategoryComponent,
        CatalogueVisibilityComponent,
        // Catalogue's Card Component
        CatalogueAmountSettingsComponent,
        CatalogueDetailComponent,
        CatalogueMediaSettingsComponent,
        CataloguePriceSettingsComponent,
        CatalogueSkuInformationComponent,
        CatalogueWeightAndDimensionComponent,
    ],
    imports: [
        CataloguesRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,
        DragDropModule,
        PipeSharedModule,

        RxReactiveFormsModule,
        NgxPermissionsModule.forChild(),
        QuillModule.forRoot({
            modules: {
                toolbar: [['bold'], [{ list: 'ordered' }, { list: 'bullet' }]],
            },
            placeholder: '',
            debug: environment.staging ? 'warn' : environment.production ? false : 'log',
        }),

        StoreModule.forFeature(fromCatalogue.FEATURE_KEY, fromCatalogue.reducer),
        StoreModule.forFeature(fromBrand.FEATURE_KEY, fromBrand.reducer),
        StoreModule.forFeature(fromExport.featureKey, fromExport.reducer),

        EffectsModule.forFeature([
            BrandEffects,
            CatalogueEffects,
            DeletePriceSegmentationEffects,
            ExportsEffects,
        ]),
    ],
    entryComponents: [
        CatalogueAmountSettingsComponent,
        CataloguesActiveInactiveComponent,
        CataloguesAddNewProductComponent,
        CataloguesEditPriceStockComponent,
        CataloguesImportComponent,
        CataloguesRemoveComponent,
        CataloguesSelectCategoryComponent,
        CatalogueWeightAndDimensionComponent,
    ],
    providers: [BrandFacadeService, CatalogueFacadeService, CataloguePriceSegmentationApiService],
})
export class CataloguesModule {}
