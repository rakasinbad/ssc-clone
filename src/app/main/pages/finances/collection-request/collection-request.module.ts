import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MaterialModule, SharedModule } from 'app/shared';
import { CollectionRequestRoutingModule } from './collection-request-routing.module';
import { CollectionRequestComponent } from './collection-request.component';

@NgModule({
    declarations: [CollectionRequestComponent],
    imports: [CollectionRequestRoutingModule, SharedModule, MaterialModule],
})
export class CollectionRequestModule {}
