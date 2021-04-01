import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { PipeSharedModule } from 'app/shared';
import { ChannelSelectSearchMultiModule } from 'app/shared/components/channel-select-search-multi';
import { ClusterSelectSearchMultiModule } from 'app/shared/components/cluster-select-search-multi';
import { GroupSelectSearchMultiModule } from 'app/shared/components/group-select-search-multi';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { TypeSelectSearchMultiModule } from 'app/shared/components/type-select-search-multi';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { environment } from 'environments/environment';
import { NgxPermissionsModule } from 'ngx-permissions';
import { QuillModule } from 'ngx-quill';
import { WarehouseSelectSearchMultiModule } from './../../../shared/components/warehouse-select-search-multi/warehouse-select-search-multi.module';
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
    CalculateAfterTaxPipe,
    ChannelPriceSettingPipe,
    ClusterPriceSettingPipe,
    GroupPriceSettingPipe,
    TypePriceSettingPipe,
    WarehousePriceSettingPipe,
} from './pipes';
import {
    BrandFacadeService,
    CatalogueFacadeService,
    CataloguePriceSegmentationApiService,
} from './services';
import { CatalogueNgrxModule } from './store';

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
        CalculateAfterTaxPipe,
        ChannelPriceSettingPipe,
        ClusterPriceSettingPipe,
        GroupPriceSettingPipe,
        TypePriceSettingPipe,
        WarehousePriceSettingPipe,
    ],
    imports: [
        CataloguesRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,
        DragDropModule,
        PipeSharedModule,
        WarehouseSelectSearchMultiModule,
        TypeSelectSearchMultiModule,
        GroupSelectSearchMultiModule,
        ChannelSelectSearchMultiModule,
        ClusterSelectSearchMultiModule,

        RxReactiveFormsModule,
        NgxPermissionsModule.forChild(),
        QuillModule.forRoot({
            modules: {
                toolbar: [['bold'], [{ list: 'ordered' }, { list: 'bullet' }]],
            },
            placeholder: '',
            debug: environment.staging ? 'warn' : environment.production ? false : 'log',
        }),

        CatalogueNgrxModule,
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
