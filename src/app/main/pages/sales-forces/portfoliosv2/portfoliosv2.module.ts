import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MaterialModule, SharedModule } from 'app/shared';
import { SrTargetRoutingModule } from './portfoliosv2-routing.module';
import { SrTargetComponent } from './portfoliosv2.component';

@NgModule({
    declarations: [SrTargetComponent],
    imports: [SrTargetRoutingModule, SharedModule, MaterialModule],
})
export class SrTargetModule {}
