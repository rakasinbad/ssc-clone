import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { FormMode } from 'app/shared/models';

@Component({
    selector: 'app-catalogue-segmentation-detail',
    templateUrl: './catalogue-segmentation-detail.component.html',
    styleUrls: ['./catalogue-segmentation-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueSegmentationDetailComponent implements OnInit {
    cardHeaderConfig: ICardHeaderConfiguration = {
        class: 'm-0 my-16',
        title: {
            label: 'Table',
        },
        // batchAction: {
        //     actions: [],
        //     show: false,
        // },
        search: {
            active: true,
        },
    };

    keyword: string = null;

    @Input()
    formMode: FormMode;

    constructor() {}

    ngOnInit() {}
}
