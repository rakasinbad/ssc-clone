import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { ReturnsComponent } from './returns.component';
import { ReturnsRoutingModule } from './returns-routing.module';
import { returnsReducer } from './store/reducers';

@NgModule({
    declarations: [
        ReturnsComponent,
    ],
    imports: [
        ReturnsRoutingModule,

        StoreModule.forFeature(returnsReducer.FEATURE_KEY, returnsReducer.reducer),
    ],
})
export class ReturnsModule {}