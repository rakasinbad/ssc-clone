import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { AssociationsRoutingModule } from './associations-routing.module';
import { AssociationsComponent } from './associations.component';
import { PortfolioStoresComponent } from './components/portfolio-stores/portfolio-stores.component';
import { AssociationsFormComponent } from './pages/associations-form/associations-form.component';

import { AssociationViewByPortfolioComponent } from './components/view-by-portfolio/view-by-portfolio.component';
import { AssociationViewBySalesRepComponent } from './components/view-by-sales-rep/view-by-sales-rep.component';
import { AssociationViewByStoreComponent } from './components/view-by-store/view-by-store.component';

import {
    AssociationEffects,
    PortfolioEffects,
    SalesRepEffects,
    StorePortfolioEffects,
    StoreEffects
} from './store/effects';

import {
    featureKey as AssociationMainFeatureKey,
    reducers as AssociationMainReducers
} from './store/reducers';

@NgModule({
    declarations: [
        AssociationsComponent,
        AssociationsFormComponent,
        // Main Component
        AssociationViewBySalesRepComponent,
        AssociationViewByPortfolioComponent,
        AssociationViewByStoreComponent,
        // Sub-components
        PortfolioStoresComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        SharedComponentsModule,
        RxReactiveFormsModule,
        AssociationsRoutingModule,
        MaterialModule,
        NgxPermissionsModule.forChild(),
        StoreModule.forFeature(AssociationMainFeatureKey, AssociationMainReducers),
        EffectsModule.forFeature([
            AssociationEffects,
            PortfolioEffects,
            SalesRepEffects,
            StoreEffects,
            StorePortfolioEffects
        ])
    ],
    entryComponents: [PortfolioStoresComponent]
})
export class AssociationsModule {}
