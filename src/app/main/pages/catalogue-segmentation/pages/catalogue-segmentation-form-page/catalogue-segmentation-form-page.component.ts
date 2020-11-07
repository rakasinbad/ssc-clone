import { Location } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormMode, FormStatus } from 'app/shared/models';
import { IBreadcrumbs, IFooterActionConfig } from 'app/shared/models/global.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CreateCatalogueSegmentationDto } from '../../models';
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
            title: 'Catalogue Segmentation',
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
    private formStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject('INVALID');
    private unSubs$: Subject<any> = new Subject();

    form: FormGroup;
    formMode: FormMode = 'add';
    createCatalogueSegmentationFormDto: CreateCatalogueSegmentationDto;
    updateCatalogueSegmentationFormDto: any;

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private catalogueSegmentationFacade: CatalogueSegmentationFacadeService,
        private catalogueSegmentationFormService: CatalogueSegmentationFormService
    ) {}

    ngOnInit(): void {
        this.formMode = this.route.snapshot.params['id'] ? 'edit' : 'add';

        if (this.formMode === 'edit') {
            this.breadcrumbs = [
                {
                    title: 'Home',
                },
                {
                    title: 'Catalogue',
                },
                {
                    title: 'Catalogue Segmentation',
                },
                {
                    title: 'Edit Catalogue Segmentation',
                    active: true,
                },
            ];
        }

        this.catalogueSegmentationFacade.createBreadcrumb(this.breadcrumbs);
        this.catalogueSegmentationFacade.setFooterConfig(this.footerConfig);
        this.catalogueSegmentationFacade.setCancelButton();

        this.form = this.catalogueSegmentationFormService.createForm();

        // Handle valid or invalid form status for footer action (SHOULD BE NEEDED)
        this._setFormStatus();

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

        // Handle save button action (footer)
        this.catalogueSegmentationFacade.clickSaveBtn$
            .pipe(
                filter((isClick) => !!isClick),
                takeUntil(this.unSubs$)
            )
            .subscribe((_) => {
                this._onSubmit();
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

    onSetFormStatus(status: FormStatus): void {
        this.formStatus$.next(status);
    }

    private _onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        console.log('ON SUBMIT', {
            create: this.createCatalogueSegmentationFormDto,
            update: this.updateCatalogueSegmentationFormDto,
        });

        if (this.formMode === 'add') {
            this.catalogueSegmentationFacade.createCatalogueSegmentation(
                this.createCatalogueSegmentationFormDto
            );
        }
    }

    private _setFormStatus(): void {
        this.formStatus$.pipe(takeUntil(this.unSubs$)).subscribe((status) => {
            console.log('FORM CORE STATUS', { status });
            if (status === 'VALID') {
                this.catalogueSegmentationFacade.setFormValid();
            } else {
                this.catalogueSegmentationFacade.setFormInvalid();
            }
        });
    }
}
