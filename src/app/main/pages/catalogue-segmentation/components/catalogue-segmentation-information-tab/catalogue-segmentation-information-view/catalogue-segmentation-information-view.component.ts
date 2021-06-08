import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CatalogueSegmentation } from '../../../models';

@Component({
    selector: 'app-catalogue-segmentation-information-view',
    templateUrl: './catalogue-segmentation-information-view.component.html',
    styleUrls: ['./catalogue-segmentation-information-view.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueSegmentationInformationViewComponent implements OnInit {
    @Input()
    item: CatalogueSegmentation;

    @Input()
    isLoading: boolean;

    constructor() {}

    ngOnInit(): void {}
}
