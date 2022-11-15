import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { InternalDetailComponent } from './internal-detail/internal-detail.component';
import { InternalFormComponent } from './internal-form/internal-form.component';
import { InternalRoutingModule } from './internal-routing.module';
import { InternalComponent } from './internal.component';
import { InternalEffects } from './store/effects';
import { fromInternal } from './store/reducers';

/**
 *
 *
 * @export
 * @class InternalModule
 */
@NgModule({
    declarations: [InternalComponent, InternalDetailComponent, InternalFormComponent],
    imports: [
        InternalRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromInternal.FEATURE_KEY, fromInternal.reducer),
        EffectsModule.forFeature([InternalEffects])
    ]
})
export class InternalModule {}
