import { NgModule } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { InStoreInventoriesRoutingModule } from './in-store-inventories-routing.module';
import { InStoreInventoriesComponent } from './in-store-inventories.component';
import { StoreCatalogueEffects } from './store/effects';
import { fromStoreCatalogue } from './store/reducers';
import { CatalogueDetailComponent } from './catalogue-detail/catalogue-detail.component';
import { fromAttendance } from '../attendances/store/reducers';
import { AttendanceEffects } from '../attendances/store/effects';

import { MerchantEffects } from '../attendances/store/effects';
import { fromMerchant } from '../attendances/store/reducers';
import { fromCatalogue } from '../catalogues/store/reducers';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';

/**
 *
 *
 * @export
 * @class InStoreInventoriesModule
 */
@NgModule({
    declarations: [
        InStoreInventoriesComponent,
        CatalogueDetailComponent,
    ],
    imports: [
        InStoreInventoriesRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        // AgmCoreModule,
        LeafletModule,
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromCatalogue.FEATURE_KEY, fromCatalogue.reducer),
        StoreModule.forFeature(fromMerchant.FEATURE_KEY, fromMerchant.reducer),
        StoreModule.forFeature(fromStoreCatalogue.FEATURE_KEY, fromStoreCatalogue.reducer),

        EffectsModule.forFeature([
            MerchantEffects,
            StoreCatalogueEffects
        ])
    ]
})
export class InStoreInventoriesModule {}
