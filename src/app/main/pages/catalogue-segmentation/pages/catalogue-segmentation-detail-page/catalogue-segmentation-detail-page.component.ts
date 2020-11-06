import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FormMode } from 'app/shared/models';

@Component({
    templateUrl: './catalogue-segmentation-detail-page.component.html',
    styleUrls: ['./catalogue-segmentation-detail-page.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class CatalogueSegmentationDetailPageComponent implements OnInit {
    formMode: FormMode;

    constructor(private route: ActivatedRoute, private router: Router) {}

    ngOnInit(): void {
        this.formMode = this._checkFormMode();

        if (this.formMode !== 'view') {
            this.router.navigateByUrl('/pages/catalogue-segmentations', { replaceUrl: true });
        }
    }

    private _checkFormMode(): FormMode {
        if (this.route.snapshot.params['id'] && this.router.url.endsWith('detail')) {
            return 'view';
        } else {
            return null;
        }
    }
}
