import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MaterialModule, SharedModule } from 'app/shared';
import { ManageRoutingModule } from './manage-routing.module';
import { ManageComponent } from './manage.component';

@NgModule({
    declarations: [ManageComponent],
    imports: [ManageRoutingModule, SharedModule, MaterialModule],
})
export class ManageModule {}
