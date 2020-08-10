import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MaterialModule, SharedModule } from 'app/shared';
import { SrTargetRoutingModule } from './sr-target-routing.module';
import { SrTargetComponent } from './sr-target.component';

@NgModule({
    declarations: [SrTargetComponent],
    imports: [SrTargetRoutingModule, SharedModule, MaterialModule],
})
export class SrTargetModule {}
