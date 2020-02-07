import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-warehouse-form',
    templateUrl: './warehouse-form.component.html',
    styleUrls: ['./warehouse-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseFormComponent implements OnInit {
    pageType: string;

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

    constructor(private route: ActivatedRoute, private router: Router) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        const { id } = this.route.snapshot.params;

        if (id === 'new') {
            this.pageType = 'new';
        } else if (Math.sign(id) === 1) {
            this.pageType = 'edit';
        } else {
            this.router.navigateByUrl('/pages/logistics/warehouses');
        }
    }
}
