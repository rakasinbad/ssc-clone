import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MaterialModule, SharedModule } from 'app/shared';
import { SrTargetRoutingModule } from './sales-repsv2-routing.module';
import { SrTargetComponent } from './sales-repsv2.component';

@NgModule({
    declarations: [SrTargetComponent],
    imports: [SrTargetRoutingModule, SharedModule, MaterialModule],
})
export class SrTargetModule {}
