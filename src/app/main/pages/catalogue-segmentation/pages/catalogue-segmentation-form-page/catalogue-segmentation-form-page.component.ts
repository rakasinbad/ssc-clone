import { Location } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IBreadcrumbs, IFooterActionConfig } from 'app/shared/models/global.model';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import {
    CatalogueSegmentationFacadeService,
    CatalogueSegmentationFormService,
} from '../../services';

@Component({
    templateUrl: './catalogue-segmentation-form-page.component.html',
    styleUrls: ['./catalogue-segmentation-form-page.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CatalogueSegmentationFormPageComponent implements OnInit, AfterViewInit, OnDestroy {
    private breadcrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Catalogue',
        },
        {
            title: 'Add Catalogue Segmentation',
            active: true,
        },
    ];
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
    private unSubs$: Subject<any> = new Subject();

    form: FormGroup;

    constructor(
        private location: Location,
        private catalogueSegmentationFacade: CatalogueSegmentationFacadeService,
        private catalogueSegmentationFormService: CatalogueSegmentationFormService
    ) {}

    ngOnInit(): void {
        this.catalogueSegmentationFacade.createBreadcrumb(this.breadcrumbs);
        this.catalogueSegmentationFacade.setFooterConfig(this.footerConfig);
        this.catalogueSegmentationFacade.setCancelButton();

        this.form = this.catalogueSegmentationFormService.createForm();

        // Handle cancel button action (footer)
        this.catalogueSegmentationFacade.clickCancelBtn$
            .pipe(
                filter((isClick) => !!isClick),
                takeUntil(this.unSubs$)
            )
            .subscribe((_) => {
                this.location.back();

                this.catalogueSegmentationFacade.resetCancelBtn();
            });
    }

    ngAfterViewInit(): void {
        this.catalogueSegmentationFacade.showFooter();
    }

    ngOnDestroy(): void {
        this.catalogueSegmentationFacade.clearBreadcrumb();
        this.catalogueSegmentationFacade.resetAllFooter();
        this.catalogueSegmentationFacade.hideFooter();

        this.unSubs$.next();
        this.unSubs$.complete();
    }
}
