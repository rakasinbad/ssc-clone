import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MaterialModule, SharedModule } from 'app/shared';
import { PjpRoutingModule } from './pjp-routing.module';
import { PjpComponent } from './pjp.component';

@NgModule({
    declarations: [PjpComponent],
    imports: [PjpRoutingModule, SharedModule, MaterialModule],
})
export class PjpModule {}
