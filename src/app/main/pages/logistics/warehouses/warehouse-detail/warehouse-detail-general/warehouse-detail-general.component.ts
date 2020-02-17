import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'app-warehouse-detail-general',
    templateUrl: './warehouse-detail-general.component.html',
    styleUrls: ['./warehouse-detail-general.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseDetailGeneralComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }
}
