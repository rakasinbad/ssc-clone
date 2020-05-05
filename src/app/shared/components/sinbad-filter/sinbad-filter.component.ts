import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SinbadFilterConfig } from './models/sinbad-filter.model';
import { SinbadFilterService } from './services/sinbad-filter.service';

@Component({
    selector: 'app-sinbad-filter',
    templateUrl: './sinbad-filter.component.html',
    styleUrls: ['./sinbad-filter.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    // encapsulation: ViewEncapsulation.None,
})
export class SinbadFilterComponent implements OnInit {
    cobaTitle: string;
    config$: Observable<SinbadFilterConfig>;
    date: Date;
    events: any[];
    notes: any[];
    settings: any;

    constructor(private _$sinbadFilterService: SinbadFilterService) {
        // Set the defaults
        this.date = new Date();
        this.settings = {
            notify: true,
            cloud: false,
            retro: true,
        };
    }

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.config$ = this._$sinbadFilterService.getConfig$();
        this.cobaTitle = this._$sinbadFilterService.cobaTitle;
    }
}
