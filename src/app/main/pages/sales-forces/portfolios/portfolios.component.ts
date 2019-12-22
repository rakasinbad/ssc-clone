import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'app-portfolios',
    templateUrl: './portfolios.component.html',
    styleUrls: ['./portfolios.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfoliosComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

}
