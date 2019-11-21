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

/**
 *
 *
 * @export
 * @class InStoreInventoriesModule
 */
@NgModule({
    declarations: [
        InStoreInventoriesComponent,
    ],
    imports: [
        InStoreInventoriesRoutingModule,

        SharedModule,
        MaterialModule,

        // AgmCoreModule,
        LeafletModule,
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromStoreCatalogue.FEATURE_KEY, fromStoreCatalogue.reducer),
        EffectsModule.forFeature([
            StoreCatalogueEffects
        ])
    ]
})
export class InStoreCataloguesModule {}
