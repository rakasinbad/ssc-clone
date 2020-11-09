import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FormMode } from 'app/shared/models';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CatalogueSegmentation } from '../../models';
import { CatalogueSegmentationFacadeService, CatalogueSegmentationService } from '../../services';

@Component({
    templateUrl: './catalogue-segmentation-detail-page.component.html',
    styleUrls: ['./catalogue-segmentation-detail-page.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class CatalogueSegmentationDetailPageComponent implements OnInit, OnDestroy {
    private isLoadingCatalogueList$: BehaviorSubject<boolean> = new BehaviorSubject(false);
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

    formMode: FormMode;
    catalogueSegmentation: CatalogueSegmentation;
    isLoading: boolean = false;
    isLoadingCombine: boolean = false;

    catalogueSegmentation$: Observable<CatalogueSegmentation>;
    isLoading$: Observable<boolean>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private catalogueSegmentationFacade: CatalogueSegmentationFacadeService,
        private catalogueSegmentationService: CatalogueSegmentationService
    ) {}

    ngOnInit(): void {
        this.formMode = this.catalogueSegmentationService.checkFormMode(
            'view',
            this.route,
            this.router
        );

        if (this.formMode !== 'view') {
            this.router.navigateByUrl('/pages/catalogue-segmentations', { replaceUrl: true });
        }

        this.catalogueSegmentationFacade.createBreadcrumb(this.breadcrumbs);

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
            }),
            map(({ isLoading }) => isLoading)
        );
    }

    ngOnDestroy(): void {
        this.catalogueSegmentationFacade.clearBreadcrumb();
        this.catalogueSegmentationFacade.resetState();
    }

    onSetLoadingCatalogueList(loading: boolean): void {
        this.isLoadingCatalogueList$.next(loading);
    }

    private _initDetail(id: string): void {
        this.catalogueSegmentationFacade.getById(id);
    }
}
