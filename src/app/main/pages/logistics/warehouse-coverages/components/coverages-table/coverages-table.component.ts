import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, Input } from '@angular/core';
import { WarehouseCoverage } from '../../models/warehouse-coverage.model';
import { NotCoveredWarehouse } from '../../models/not-covered-warehouse.model';

@Component({
    selector: 'app-warehouse-coverages-table',
    templateUrl: './coverages-table.component.html',
    styleUrls: ['./coverages-table.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoveragesTableComponent implements OnInit, OnDestroy {

    @Input() viewBy: 'warehouse' | 'area' = 'warehouse';
    @Input() areaType: 'covered' | 'not_covered' = 'covered';
    @Input() dataSource: Array<WarehouseCoverage> | Array<NotCoveredWarehouse>;
    // tslint:disable-next-line: no-inferrable-types
    @Input() loadingState: boolean = false;

    constructor() { }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {

    }

}
