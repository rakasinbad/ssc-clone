import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

import { SalesRep } from '../../models';
import { Portfolio } from 'app/shared/models';

@Component({
    selector: 'app-sales-rep-detail-info',
    templateUrl: './sales-rep-detail-info.component.html',
    styleUrls: ['./sales-rep-detail-info.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesRepDetailInfoComponent implements OnInit {
    @Input() salesRep: SalesRep;
    @Input() isLoading: boolean;

    constructor() {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }

    isChecked(status: string): boolean {
        return status === 'active' ? true : false;
    }

    safeValue(value: any): any {
        if (typeof value === 'number') {
            return value;
        } else {
            return value ? value : '-';
        }
    }

    totalPortfolio(porfolios: Array<Portfolio>): number {
        return porfolios ? porfolios.length || 0 : 0;
    }
}
