import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FuseSharedModule } from '@fuse/shared.module';

import { Error404RoutingModule } from './error-404-routing.module';
import { Error404Component } from './error-404.component';

@NgModule({
    declarations: [Error404Component],
    imports: [Error404RoutingModule, MatIconModule, FuseSharedModule]
})
export class Error404Module {}
