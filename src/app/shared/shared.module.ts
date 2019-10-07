import { TitleCasePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';

import { FilterAdvancedModule } from './components/filter-advanced/filter-advanced.module';
import { FiltersModule } from './components/filters/filters.module';
import { ErrorNoticeComponent } from './components/notices/error-notice/error-notice.component';
import { SuccessNoticeComponent } from './components/notices/success-notice/success-notice.component';
import { WarningNoticeComponent } from './components/notices/warning-notice/warning-notice.component';
import { CheckboxValidatorDirective, ContentDirective } from './directives';
import { MaterialModule } from './material.module';
import { FilterAdvancedFormComponent } from './modals/filter-advanced-form/filter-advanced-form.component';
import { HighlightPipe } from './pipes';

@NgModule({
    declarations: [
        HighlightPipe,
        ContentDirective,
        CheckboxValidatorDirective,
        FilterAdvancedFormComponent,
        ErrorNoticeComponent,
        SuccessNoticeComponent,
        WarningNoticeComponent
    ],
    imports: [
        MaterialModule,
        FiltersModule,
        FilterAdvancedModule,
        TranslateModule.forChild({}),
        FuseSharedModule
    ],
    exports: [
        HighlightPipe,
        FiltersModule,
        FilterAdvancedModule,
        ContentDirective,
        CheckboxValidatorDirective,
        TranslateModule,
        FuseSharedModule
    ],
    providers: [TitleCasePipe],
    entryComponents: [
        FilterAdvancedFormComponent,
        ErrorNoticeComponent,
        SuccessNoticeComponent,
        WarningNoticeComponent
    ]
})
export class SharedModule {}
