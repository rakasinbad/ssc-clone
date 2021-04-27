import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MaterialModule, SharedModule } from 'app/shared';
import { QuestRoutingModule } from './quest-routing.module';
import { QuestComponent } from './quest.component';

@NgModule({
    declarations: [QuestComponent],
    imports: [QuestRoutingModule, SharedModule, MaterialModule],
})
export class QuestModule {}
