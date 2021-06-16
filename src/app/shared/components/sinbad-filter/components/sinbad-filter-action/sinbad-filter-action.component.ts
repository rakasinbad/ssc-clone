import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { SinbadFilterAction } from './../../models/sinbad-filter.model';

@Component({
    selector: 'app-sinbad-filter-action',
    templateUrl: './sinbad-filter-action.component.html',
    styleUrls: ['./sinbad-filter-action.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SinbadFilterActionComponent implements OnInit, OnChanges, OnDestroy {
    @Input()
    form: FormGroup;

    @Input()
    config: SinbadFilterAction[];

    @Output()
    clickReset: EventEmitter<void> = new EventEmitter();

    @Output()
    clickSubmit: EventEmitter<void> = new EventEmitter();

    _isSubmitDisabled$ = new BehaviorSubject<boolean>(true);

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor() {
    }

    ngOnInit(): void {

        // Check form for enable or disable submit button
        this.form.valueChanges
            .pipe(
                distinctUntilChanged(),
                takeUntil(this._unSubs$)
            )
            .subscribe(v => {
                const obj: Array<any> = Object.entries(v);

                this._isSubmitDisabled$.next(true);
                
                obj.some((v) => {
                    /**
                     * v[0] is name of key
                     * v[1] is name of value
                     *  */ 
                    if (!!v && !!v[1]) {
                        if (Array.isArray(v[1]) && v[1].length > 0) {
                          this._isSubmitDisabled$.next(false);
                          return true;
                        } else if (!Array.isArray(v[1])) {
                          this._isSubmitDisabled$.next(false);
                          return true;
                        }
                    }
                })
            });
    }

    ngOnChanges(changes: SimpleChanges): void {}

    ngOnDestroy() {
        this._unSubs$.next();
        this._unSubs$.complete();
        this._isSubmitDisabled$.next(true);
        this._isSubmitDisabled$.complete();
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

    onClickReset(): void {
        this.clickReset.emit();
    }

    onClickSubmit(): void {
        this.clickSubmit.emit();
    }
}
