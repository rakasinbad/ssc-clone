import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { SinbadFilterAction } from './../../models/sinbad-filter.model';

@Component({
    selector: 'app-sinbad-filter-action',
    templateUrl: './sinbad-filter-action.component.html',
    styleUrls: ['./sinbad-filter-action.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SinbadFilterActionComponent implements OnInit, OnChanges {
    @Input()
    config: SinbadFilterAction[];

    @Output()
    clickReset: EventEmitter<void> = new EventEmitter();

    @Output()
    clickSubmit: EventEmitter<void> = new EventEmitter();

    constructor() {}

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {}

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

    onClickReset(): void {
        this.clickReset.emit();
    }

    onClickSubmit(): void {
        this.clickSubmit.emit();
    }
}
