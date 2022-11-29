/** Angular and Third-party Libraries. */
import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { SettingsRoutingModule } from './settings.routes';

@NgModule({
    imports: [
        SettingsRoutingModule,
        SharedModule,
    ]
})
export class SettingsModule { }
