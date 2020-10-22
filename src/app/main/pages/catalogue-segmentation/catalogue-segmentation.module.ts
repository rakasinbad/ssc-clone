import { NgModule } from '@angular/core';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule, SharedModule } from 'app/shared';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { CatalogueSegmentationComponent } from './catalogue-segmentation.component';
import { CatalogueSegmentationRoutingModule } from './catalogue-segmentation.routes';
import { CatalogueSegmentationListComponent } from './components';
import { CatalogueSegmentationFacadeService } from './services';

@NgModule({
    declarations: [CatalogueSegmentationComponent, CatalogueSegmentationListComponent],
    imports: [
        CatalogueSegmentationRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        RxReactiveFormsModule,
        NgxPermissionsModule.forChild(),
    ],
    providers: [CatalogueSegmentationFacadeService],
})
export class CatalogueSegmentationModule {}
