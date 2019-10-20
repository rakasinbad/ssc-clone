import { TitleCasePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';

import { FilterAdvancedModule } from './components/filter-advanced/filter-advanced.module';
import { FiltersModule } from './components/filters/filters.module';
import { ErrorNoticeComponent } from './components/notices/error-notice/error-notice.component';
import { SuccessNoticeComponent } from './components/notices/success-notice/success-notice.component';
import { WarningNoticeComponent } from './components/notices/warning-notice/warning-notice.component';
import { CheckboxValidatorDirective, ContentDirective } from './directives';
import { MaterialModule } from './material.module';
import { FilterAdvancedFormComponent } from './modals/filter-advanced-form/filter-advanced-form.component';
import { HighlightPipe, PricePipe } from './pipes';

/**
 *
 *
 * @export
 * @class SharedModule
 */
@NgModule({
    declarations: [
        HighlightPipe,
        PricePipe,
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
        NgxMaskModule,
        FuseSharedModule
    ],
    exports: [
        HighlightPipe,
        PricePipe,
        FiltersModule,
        FilterAdvancedModule,
        ContentDirective,
        CheckboxValidatorDirective,
        TranslateModule,
        NgxMaskModule,
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
