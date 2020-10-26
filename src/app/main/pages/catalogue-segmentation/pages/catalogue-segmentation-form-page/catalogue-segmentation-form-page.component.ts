import { AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { IFooterActionConfig } from 'app/shared/models/global.model';
import { CatalogueSegmentationFacadeService } from '../../services';

@Component({
    templateUrl: './catalogue-segmentation-form-page.component.html',
    styleUrls: ['./catalogue-segmentation-form-page.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CatalogueSegmentationFormPageComponent implements OnInit, AfterViewInit, OnDestroy {
    private footerConfig: IFooterActionConfig = {
        progress: {
            title: {
                label: 'Skor tambah toko',
                active: false,
            },
            value: {
                active: false,
            },
            active: false,
        },
        action: {
            save: {
                label: 'Save',
                active: true,
            },
            draft: {
                label: 'Save Draft',
                active: false,
            },
            cancel: {
                label: 'Cancel',
                active: true,
            },
        },
    };

    constructor(private catalogueSegmentationFacade: CatalogueSegmentationFacadeService) {}

    ngOnInit(): void {
        this.catalogueSegmentationFacade.setFooterConfig(this.footerConfig);
        this.catalogueSegmentationFacade.setCancelButton();
    }

    ngAfterViewInit(): void {
        this.catalogueSegmentationFacade.showFooter();
    }

    ngOnDestroy(): void {
        this.catalogueSegmentationFacade.clearBreadcrumb();
        this.catalogueSegmentationFacade.resetAllFooter();
        this.catalogueSegmentationFacade.hideFooter();
    }
}
