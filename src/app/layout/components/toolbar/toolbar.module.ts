import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { FuseSearchBarModule, FuseShortcutsModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ToolbarComponent } from 'app/layout/components/toolbar/toolbar.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SingleSpaModule } from 'single-spa/single-spa.module';

@NgModule({
    declarations: [ToolbarComponent],
    imports: [
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,

        FuseSharedModule,
        FuseSearchBarModule,
        FuseShortcutsModule,
        
        NgxPermissionsModule.forChild(),
        TranslateModule.forChild(),

        SingleSpaModule
    ],
    exports: [ToolbarComponent]
})
export class ToolbarModule {}
