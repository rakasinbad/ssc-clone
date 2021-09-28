import { NgModule } from '@angular/core';
import { ReturnsComponent } from './returns.component';
import { ReturnsRoutingModule } from './returns-routing.module';

@NgModule({
    declarations: [
        ReturnsComponent,
    ],
    imports: [
        ReturnsRoutingModule,
    ],
})
export class ReturnsModule {}