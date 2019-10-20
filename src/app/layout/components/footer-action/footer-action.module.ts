import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { FuseSharedModule } from '@fuse/shared.module';

import { FooterActionComponent } from './footer-action.component';

@NgModule({
    declarations: [FooterActionComponent],
    imports: [
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatToolbarModule,
        FuseSharedModule
    ],
    exports: [FooterActionComponent]
})
export class FooterActionModule {}
