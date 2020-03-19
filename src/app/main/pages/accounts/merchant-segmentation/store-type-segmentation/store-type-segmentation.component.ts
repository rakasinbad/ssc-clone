import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';

@Component({
    selector: 'app-store-type-segmentation',
    templateUrl: './store-type-segmentation.component.html',
    styleUrls: ['./store-type-segmentation.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreTypeSegmentationComponent implements OnInit {
    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        class: 'm-0 mt-4 mb-16',
        title: {
            label: 'Store Segmentation'
        },
        search: {
            active: true
        },
        // add: {
        //     permissions: [],
        // },
        viewBy: {
            list: [
                { id: 'segment-tree', label: 'Segment Tree' },
                { id: 'store', label: 'Store' }
            ]
        }
        // export: {
        //     permissions: [],
        //     useAdvanced: true,
        //     pageType: ''
        // }
        // import: {
        //     permissions: [''],
        //     useAdvanced: true,
        //     pageType: ''
        // },
    };

    constructor() {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }
}
