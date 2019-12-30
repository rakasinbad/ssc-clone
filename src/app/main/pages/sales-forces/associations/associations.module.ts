import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';

import { AssociationsRoutingModule } from './associations-routing.module';
import { AssociationsComponent } from './associations.component';
import { AssociationEffects } from './store/effects';
import * as fromAssociations from './store/reducers';

@NgModule({
    declarations: [AssociationsComponent],
    imports: [
        CommonModule,
        SharedModule,
        RxReactiveFormsModule,
        AssociationsRoutingModule,
        MaterialModule,
        StoreModule.forFeature(fromAssociations.featureKey, fromAssociations.reducers),
        EffectsModule.forFeature([AssociationEffects])
    ]
})
export class AssociationsModule {}
