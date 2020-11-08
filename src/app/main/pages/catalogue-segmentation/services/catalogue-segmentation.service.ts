import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormMode } from 'app/shared/models';
import { CatalogueSegmentationModule } from '../catalogue-segmentation.module';

@Injectable({ providedIn: CatalogueSegmentationModule })
export class CatalogueSegmentationService {
    constructor() {}

    checkFormMode(page: 'form' | 'view', route: ActivatedRoute, router: Router): FormMode {
        const { id } = route.snapshot.params;

        switch (page) {
            case 'form':
                if (id && router.url.endsWith('edit')) {
                    return 'edit';
                } else if (router.url.endsWith('add')) {
                    return 'add';
                }

                return null;

            case 'view':
                if (id && router.url.endsWith('detail')) {
                    return 'view';
                }

                return null;

            default:
                return null;
        }
    }
}
