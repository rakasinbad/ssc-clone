import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';

import { AssociationsRoutingModule } from './associations-routing.module';
import { AssociationsComponent } from './associations.component';
import { AssociationHeaderSearchComponent } from './components/header-search/association-header-search.component';
import { AssociationViewByComponent } from './components/view-by/association-view-by.component';
import { AssociationSalesRepComponent } from './components/sales-rep/association-sales-rep.component';
import { AssociationPortfolioComponent } from './components/portfolio/association-portfolio.component';
import { AssociationStoreComponent } from './components/store/association-store.component';
import { AssociationEffects } from './store/effects';
import * as fromAssociations from './store/reducers';
import { AssociationsFormComponent } from './pages/associations-form/associations-form.component';

@NgModule({
    declarations: [
        AssociationsComponent,
        AssociationHeaderSearchComponent,
        AssociationViewByComponent,
        AssociationsFormComponent,
        // Main Component
        AssociationSalesRepComponent,
        AssociationPortfolioComponent,
        AssociationStoreComponent
    ],
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
