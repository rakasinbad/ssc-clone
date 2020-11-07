import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FormMode } from 'app/shared/models';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CatalogueSegmentation } from '../../models';
import { CatalogueSegmentationFacadeService } from '../../services';

@Component({
    templateUrl: './catalogue-segmentation-detail-page.component.html',
    styleUrls: ['./catalogue-segmentation-detail-page.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class CatalogueSegmentationDetailPageComponent implements OnInit, OnDestroy {
    formMode: FormMode;
    catalogueSegmentation: CatalogueSegmentation;
    isLoading: boolean = false;

    catalogueSegmentation$: Observable<CatalogueSegmentation>;
    isLoading$: Observable<boolean>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private catalogueSegmentationFacade: CatalogueSegmentationFacadeService
    ) {}

    ngOnInit(): void {
        this.formMode = this._checkFormMode();

        if (this.formMode !== 'view') {
            this.router.navigateByUrl('/pages/catalogue-segmentations', { replaceUrl: true });
        }

        this.catalogueSegmentation$ = this.catalogueSegmentationFacade.catalogueSegmentation$.pipe(
            tap((item) => {
                const { id } = this.route.snapshot.params;

                if (!item) {
                    this._initDetail(id);
                }

                this.catalogueSegmentation = item;
            })
        );

        this.isLoading$ = this.catalogueSegmentationFacade.isLoading$.pipe(
            tap((isLoading) => (this.isLoading = isLoading))
        );
    }

    ngOnDestroy(): void {
        this.catalogueSegmentationFacade.resetState();
    }

    private _checkFormMode(): FormMode {
        if (this.route.snapshot.params['id'] && this.router.url.endsWith('detail')) {
            return 'view';
        } else {
            return null;
        }
    }

    private _initDetail(id: string): void {
        this.catalogueSegmentationFacade.getById(id);
    }
}
