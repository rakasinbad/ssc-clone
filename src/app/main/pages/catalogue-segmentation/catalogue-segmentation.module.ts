import { NgModule } from '@angular/core';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule, PipeSharedModule, SharedModule } from 'app/shared';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { CatalogueSegmentationComponent } from './catalogue-segmentation.component';
import { CatalogueSegmentationRoutingModule } from './catalogue-segmentation.routes';
import {
    CatalogueListComponent,
    CatalogueSegmentationFormComponent,
    CatalogueSegmentationListComponent,
} from './components';
import { CatalogueSegmentationFormPageComponent } from './pages';
import {
    CatalogueApiService,
    CatalogueFacadeService,
    CatalogueSegmentationApiService,
    CatalogueSegmentationFacadeService,
    CatalogueSegmentationFormService,
} from './services';
import { CatalogueSegmentationNgrxModule } from './store';

@NgModule({
    declarations: [
        CatalogueListComponent,
        CatalogueSegmentationComponent,
        CatalogueSegmentationFormComponent,
        CatalogueSegmentationFormPageComponent,
        CatalogueSegmentationListComponent,
    ],
    imports: [
        CatalogueSegmentationRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,
        PipeSharedModule,

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
    ],
})
export class CatalogueSegmentationModule {}
