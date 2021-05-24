import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FormMode } from 'app/shared/models';
import { IBreadcrumbs, IFooterActionConfig } from 'app/shared/models/global.model';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { CatalogueSegmentation } from '../../models';
import {
    CatalogueSegmentationFacadeService,
    CatalogueSegmentationService,
    CatalogueSegmentationFormService,
} from '../../services';
import { FormGroup } from '@angular/forms';

@Component({
    templateUrl: './catalogue-segmentation-detail-page.component.html',
    styleUrls: ['./catalogue-segmentation-detail-page.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class CatalogueSegmentationDetailPageComponent implements OnInit, OnDestroy {
    private isLoadingCatalogueList$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private unSubs$: Subject<any> = new Subject();

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
            title: 'Catalogue Segmentation Detail',
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

    form: FormGroup;
    formMode: FormMode;
    catalogueSegmentation: CatalogueSegmentation;
    isLoading: boolean = false;
    isLoadingCombine: boolean = false;
    selectedIndex: number = 0;

    catalogueSegmentation$: Observable<CatalogueSegmentation>;
    isLoading$: Observable<boolean>;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly catalogueSegmentationFacade: CatalogueSegmentationFacadeService,
        private readonly catalogueSegmentationService: CatalogueSegmentationService,
        private readonly catalogueSegmentationFormService: CatalogueSegmentationFormService
    ) {}

    ngOnInit(): void {
        this.formMode = this.catalogueSegmentationService.checkFormMode(
            'view',
            this.route,
            this.router
        );

        if (this.formMode !== 'view' && this.formMode !== 'edit') {
            this.router.navigateByUrl('/pages/catalogue-segmentations', { replaceUrl: true });
        }

        this.catalogueSegmentationFacade.createBreadcrumb(this.breadcrumbs);
        this.catalogueSegmentationFacade.setFooterConfig(this.footerConfig);
        this.catalogueSegmentationFacade.setCancelButton();

        this.form = this.catalogueSegmentationFormService.createForm();

        this.catalogueSegmentation$ = this.catalogueSegmentationFacade.catalogueSegmentation$.pipe(
            tap((item) => {
                const { id } = this.route.snapshot.params;

                if (!item) {
                    this._initDetail(id);
                }

                this.catalogueSegmentation = item;
            })
        );

        this.isLoading$ = combineLatest([
            this.isLoadingCatalogueList$,
            this.catalogueSegmentationFacade.isLoading$,
        ]).pipe(
            map(([isLoadingCatalogueList, isLoading]) => ({
                isLoadingCatalogueList,
                isLoading,
            })),
            tap(({ isLoadingCatalogueList, isLoading }) => {
                this.isLoading = isLoading;
                this.isLoadingCombine = isLoading || isLoadingCatalogueList;

                console.log('ISLOADING', {
                    isLoadingCatalogueList,
                    isLoading,
                    isLoadingCombine: this.isLoadingCombine,
                });
            }),
            map(({ isLoading }) => isLoading)
        );

        // Handle cancel button action (footer)
        this.catalogueSegmentationFacade.clickCancelBtn$
            .pipe(
                filter((isClick) => !!isClick),
                takeUntil(this.unSubs$)
            )
            .subscribe((_) => {
                this.formMode = 'view';
                this.onHandleFooter();
                this.catalogueSegmentationFacade.resetCancelBtn();
            });
    }

    ngOnDestroy(): void {
        this.catalogueSegmentationFacade.clearBreadcrumb();
        this.catalogueSegmentationFacade.resetState();
    }

    onEdit(): void {
        this.formMode = 'edit';
    }

    onHandleFooter(): void {
        console.log(`[onHandleFooter] CatalogueSegmentationDetailPageComponent`, {
            formMode: this.formMode,
        });

        if (this.formMode === 'edit') {
            this.catalogueSegmentationFacade.showFooter();
        } else {
            this.catalogueSegmentationFacade.hideFooter();
        }
    }

    onSetLoadingCatalogueList(loading: boolean): void {
        this.isLoadingCatalogueList$.next(loading);
    }

    private _initDetail(id: string): void {
        this.catalogueSegmentationFacade.getById(id);
    }
}
