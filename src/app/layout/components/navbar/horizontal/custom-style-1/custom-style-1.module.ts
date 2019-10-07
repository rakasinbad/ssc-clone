import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FuseNavigationModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';

import { NavbarHorizontalCustomStyle1Component } from './custom-style-1.component';

@NgModule({
    declarations: [NavbarHorizontalCustomStyle1Component],
    imports: [MatButtonModule, MatIconModule, FuseSharedModule, FuseNavigationModule],
    exports: [NavbarHorizontalCustomStyle1Component]
})
export class NavbarHorizontalCustomStyle1Module {}
