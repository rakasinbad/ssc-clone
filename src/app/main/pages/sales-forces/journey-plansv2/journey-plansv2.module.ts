import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MaterialModule, SharedModule } from 'app/shared';
import { JourneyPlanV2RoutingModule } from './journey-plansv2-routing.module';
import { JourneyPlanV2Component } from './journey-plansv2.component';

@NgModule({
    declarations: [JourneyPlanV2Component],
    imports: [JourneyPlanV2RoutingModule, SharedModule, MaterialModule],
})
export class JourneyPlanV2Module {}
