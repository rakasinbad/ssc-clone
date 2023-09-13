import { AgmCoreModule } from '@agm/core';
import { TitleCasePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { NgxMaskModule } from 'ngx-mask';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ApplyDialogModule } from './components/dialogs/apply-dialog/apply-dialog.module';
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
    MaterialElevationDirective,
    TabAutocompleteDirective,
    TrackScrollDirective,
} from './directives';
import { MaterialModule } from './material.module';
import { ChangeConfirmationComponent } from './modals/change-confirmation/change-confirmation.component';
import { DeleteCatalogueSegmentationsComponent } from './modals/delete-catalogue-segmentations/delete-catalogue-segmentations.component';
import { DeleteConfirmationComponent } from './modals/delete-confirmation/delete-confirmation.component';
import { FilterAdvancedFormComponent } from './modals/filter-advanced-form/filter-advanced-form.component';
import { ShowImageComponent } from './modals/show-image/show-image.component';
import { WarningModalComponent } from './modals/warning-modal/warning-modal.component';
import { PricePipe, ReplacePipe, SafePipe } from './pipes';
import { SingleSpaModule } from 'single-spa/single-spa.module';
import { MatIconModule } from '@angular/material';

@NgModule({
    declarations: [
        // Pipe
        PricePipe,
        ReplacePipe,
        SafePipe,

        // Directive
        ContentDirective,
        CheckboxValidatorDirective,
        MaterialElevationDirective,
        TabAutocompleteDirective,
        TrackScrollDirective,

        // Component
        ScrollTopComponent,

        // Component (Dialog, Modal, Snackbar)

        ErrorNoticeComponent,
        InfoNoticeComponent,
        SuccessNoticeComponent,
        WarningNoticeComponent,

        ChangeConfirmationComponent,
        DeleteConfirmationComponent,
        DeleteCatalogueSegmentationsComponent,
        WarningModalComponent,

        FilterAdvancedFormComponent,
        ShowImageComponent,
    ],
    imports: [
        // Custom Module
        FiltersModule,
        FilterAdvancedModule,
        ApplyDialogModule,
        MaterialModule,

        // Third Party
        TranslateModule.forChild({}),
        LazyLoadImageModule,
        NgxMaskModule,
        NgxSkeletonLoaderModule,
        AgmCoreModule,

        // Fuse Theme
        FuseSharedModule,
        MatIconModule,
        // ExportsModule,
        // CardHeaderModule,
        // SharedComponentsModule,

        // single spa
        SingleSpaModule
    ],
    exports: [
        // Pipe
        PricePipe,
        ReplacePipe,
        SafePipe,

        // Directive
        ContentDirective,
        CheckboxValidatorDirective,
        MaterialElevationDirective,
        TabAutocompleteDirective,
        TrackScrollDirective,

        // Custom Module
        FiltersModule,
        FilterAdvancedModule,
        ApplyDialogModule,
        // ExportsModule,
        // CardHeaderModule,
        // SharedComponentsModule,

        // Third Party
        TranslateModule,
        LazyLoadImageModule,
        NgxMaskModule,
        NgxSkeletonLoaderModule,
        AgmCoreModule,

        // Fuse Theme
        FuseSharedModule,

        // Component
        ScrollTopComponent,

        // Component (Dialog, Modal, Snackbar)
        DeleteConfirmationComponent,
        DeleteCatalogueSegmentationsComponent,
        ChangeConfirmationComponent,
        ShowImageComponent,
        WarningModalComponent,

        // single spa
        SingleSpaModule
    ],
    providers: [TitleCasePipe],
    entryComponents: [
        ErrorNoticeComponent,
        InfoNoticeComponent,
        SuccessNoticeComponent,
        WarningNoticeComponent,

        ChangeConfirmationComponent,
        DeleteConfirmationComponent,
        DeleteCatalogueSegmentationsComponent,

        FilterAdvancedFormComponent,
        ShowImageComponent,
        // SearchBarComponent,

        WarningModalComponent
    ],
})
export class SharedModule {}
