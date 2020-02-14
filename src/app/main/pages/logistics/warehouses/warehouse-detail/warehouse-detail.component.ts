import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'app-warehouse-detail',
    templateUrl: './warehouse-detail.component.html',
    styleUrls: ['./warehouse-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseDetailComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }
}
