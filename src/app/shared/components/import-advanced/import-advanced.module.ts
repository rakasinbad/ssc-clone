import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';

import { ImportAdvancedComponent } from './import-advanced.component';
import {
    ImportDialogComponent,
    ImportHistoryComponent,
    MainImportComponent,
    TemplateHistoryComponent
} from './import-dialog';
import { ImportAdvancedStoreModule } from './store/import-advanced-store.module';

@NgModule({
    declarations: [
        ImportAdvancedComponent,
        ImportDialogComponent,
        MainImportComponent,
        ImportHistoryComponent,
        TemplateHistoryComponent
    ],
    imports: [
        FuseSharedModule,

        // Material
        MaterialModule,

        // Third Party
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        TranslateModule.forChild({}),

        ImportAdvancedStoreModule
    ],
    exports: [ImportAdvancedComponent, ImportDialogComponent],
    entryComponents: [ImportDialogComponent]
})
export class ImportAdvancedModule {}
