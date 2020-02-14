import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'app-warehouse-detail-location',
    templateUrl: './warehouse-detail-location.component.html',
    styleUrls: ['./warehouse-detail-location.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseDetailLocationComponent implements OnInit {
    opts = {
        minZoom: 3,
        maxZoom: 18,
        zoom: 5,
        lat: -2.5,
        lng: 117.86,
        icon: {
            url: 'assets/images/marker.png',
            scaledSize: {
                width: 18,
                height: 30
            }
        }
    };

    constructor() {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }
}
