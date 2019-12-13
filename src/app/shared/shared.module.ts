import { TitleCasePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { NgxMaskModule } from 'ngx-mask';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { ExportAdvancedModule } from './components/export-advanced/export-advanced.module';
import { FilterAdvancedModule } from './components/filter-advanced/filter-advanced.module';
import { FiltersModule } from './components/filters/filters.module';
import { ErrorNoticeComponent } from './components/notices/error-notice/error-notice.component';
import { InfoNoticeComponent } from './components/notices/info-notice/info-notice.component';
import { SuccessNoticeComponent } from './components/notices/success-notice/success-notice.component';
import { WarningNoticeComponent } from './components/notices/warning-notice/warning-notice.component';
import { ScrollTopComponent } from './components/scroll-top/scroll-top.component';
import {
    CheckboxValidatorDirective,
    ContentDirective,
    MaterialElevationDirective
} from './directives';
import { MaterialModule } from './material.module';
import { ChangeConfirmationComponent } from './modals/change-confirmation/change-confirmation.component';
import { DeleteConfirmationComponent } from './modals/delete-confirmation/delete-confirmation.component';
import { FilterAdvancedFormComponent } from './modals/filter-advanced-form/filter-advanced-form.component';
import { ShowImageComponent } from './modals/show-image/show-image.component';
import { HighlightPipe, PricePipe, ReplacePipe, SafePipe } from './pipes';

/**
 *
 *
 * @export
 * @class SharedModule
 */
@NgModule({
    declarations: [
        // Pipe
        HighlightPipe,
        PricePipe,
        ReplacePipe,
        SafePipe,

        // Directive
        ContentDirective,
        CheckboxValidatorDirective,
        MaterialElevationDirective,

        // Component
        ScrollTopComponent,

        // Component (Dialog, Modal, Snackbar)
        ErrorNoticeComponent,
        InfoNoticeComponent,
        SuccessNoticeComponent,
        WarningNoticeComponent,

        ChangeConfirmationComponent,
        DeleteConfirmationComponent,

        FilterAdvancedFormComponent,
        ShowImageComponent
    ],
    imports: [
        // Custom Module
        ExportAdvancedModule,
        FiltersModule,
        FilterAdvancedModule,
        MaterialModule,

        // Third Party
        TranslateModule.forChild({}),
        LazyLoadImageModule,
        NgxMaskModule,
        NgxSkeletonLoaderModule,

        // Fuse Theme
        FuseSharedModule
    ],
    exports: [
        // Pipe
        HighlightPipe,
        PricePipe,
        ReplacePipe,
        SafePipe,

        // Directive
        ContentDirective,
        CheckboxValidatorDirective,
        MaterialElevationDirective,

        // Custom Module
        ExportAdvancedModule,
        FiltersModule,
        FilterAdvancedModule,

        // Third Party
        TranslateModule,
        LazyLoadImageModule,
        NgxMaskModule,
        NgxSkeletonLoaderModule,

        // Fuse Theme
        FuseSharedModule,

        // Component
        ScrollTopComponent,

        // Component (Dialog, Modal, Snackbar)
        DeleteConfirmationComponent,
        ChangeConfirmationComponent,
        ShowImageComponent
    ],
    providers: [TitleCasePipe],
    entryComponents: [
        ErrorNoticeComponent,
        InfoNoticeComponent,
        SuccessNoticeComponent,
        WarningNoticeComponent,

        ChangeConfirmationComponent,
        DeleteConfirmationComponent,

        FilterAdvancedFormComponent,
        ShowImageComponent
    ]
})
export class SharedModule {}
