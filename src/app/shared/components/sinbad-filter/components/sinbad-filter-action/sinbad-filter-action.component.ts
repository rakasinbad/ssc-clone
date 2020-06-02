import { SinbadFilterAction } from './../../models/sinbad-filter.model';
import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    Input,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { SinbadFilterConfig } from '../../models/sinbad-filter.model';

@Component({
    selector: 'app-sinbad-filter-action',
    templateUrl: './sinbad-filter-action.component.html',
    styleUrls: ['./sinbad-filter-action.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SinbadFilterActionComponent implements OnInit, OnChanges {
    @Input()
    config: SinbadFilterAction[];

    constructor() {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        // console.log('Action 1', this.config);
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        // Add '${implements OnChanges}' to the class.
        // console.log('Action 2A', this.config);
        // console.log('Action 2B', changes);
    }

    getReset(): SinbadFilterAction {
        return this.config && this.config.length > 0
            ? this.config.find((conf) => conf.action === 'reset')
            : null;
    }

    getSubmit(): SinbadFilterAction {
        return this.config && this.config.length > 0
            ? this.config.find((conf) => conf.action === 'submit')
            : null;
    }
}
