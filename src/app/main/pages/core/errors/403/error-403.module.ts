import { NgModule } from '@angular/core';
import { MatButtonModule, MatIconModule } from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';

import { Error403RoutingModule } from './error-403-routing.module';
import { Error403Component } from './error-403.component';

@NgModule({
    declarations: [Error403Component],
    imports: [Error403RoutingModule, MatButtonModule, MatIconModule, FuseSharedModule]
})
export class Error403Module {}
