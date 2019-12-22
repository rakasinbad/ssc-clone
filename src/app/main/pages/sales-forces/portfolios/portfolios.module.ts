import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortfoliosRoutingModule } from './portfolios-routing.module';
import { PortfoliosComponent } from './portfolios.component';
import { StoreModule } from '@ngrx/store';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';


@NgModule({
    declarations: [PortfoliosComponent],
    imports: [
        CommonModule,
        SharedModule,
        PortfoliosRoutingModule,
        MaterialModule,

        // StoreModule.forFeature(fromBrand.FEATURE_KEY, fromBrand.reducer),

        // EffectsModule.forFeature([ BrandEffects, CatalogueEffects ])
    ]
})
export class PortfoliosModule { }
