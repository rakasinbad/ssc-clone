import { NgModule } from '@angular/core';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { DirectiveSharedModule, MaterialModule, PipeSharedModule, SharedModule } from 'app/shared';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { CatalogueSegmentationComponent } from './catalogue-segmentation.component';
import { CatalogueSegmentationRoutingModule } from './catalogue-segmentation.routes';
import { AvailableCatalogueListComponent, CatalogueListComponent, CatalogueSegmentationAssignSkuTabComponent, CatalogueSegmentationDetailComponent, CatalogueSegmentationFormComponent, CatalogueSegmentationInformationTabComponent, CatalogueSegmentationListComponent } from './components';
import { CatalogueSegmentationDetailPageComponent, CatalogueSegmentationFormPageComponent } from './pages';
import { CatalogueApiService, CatalogueFacadeService, CatalogueSegmentationApiService, CatalogueSegmentationFacadeService, CatalogueSegmentationFormService, CatalogueSegmentationService } from './services';
import { CatalogueSegmentationNgrxModule } from './store';

@NgModule({
    declarations: [
        AvailableCatalogueListComponent,
        CatalogueListComponent,
        CatalogueSegmentationAssignSkuTabComponent,
        CatalogueSegmentationComponent,
        CatalogueSegmentationDetailComponent,
        CatalogueSegmentationDetailPageComponent,
        CatalogueSegmentationFormComponent,
        CatalogueSegmentationFormPageComponent,
        CatalogueSegmentationInformationTabComponent,
        CatalogueSegmentationListComponent,
    ],
    imports: [
        CatalogueSegmentationRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,
        PipeSharedModule,
        DirectiveSharedModule,

        RxReactiveFormsModule,
        NgxPermissionsModule.forChild(),

        CatalogueSegmentationNgrxModule,
    ],
    providers: [
        CatalogueApiService,
        CatalogueFacadeService,
        CatalogueSegmentationApiService,
        CatalogueSegmentationFacadeService,
        CatalogueSegmentationFormService,
        CatalogueSegmentationService,
    ],
})
export class CatalogueSegmentationModule {}
