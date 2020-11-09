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
import { FormBuilder, FormGroup } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { CatalogueVisibility } from '../../models';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';
import { CatalogueFacadeService } from '../../services';
import { FormStatus } from 'app/shared/models/global.model';

type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'app-catalogue-visibility',
    templateUrl: './catalogue-visibility.component.html',
    styleUrls: ['./catalogue-visibility.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueVisibilityComponent implements OnInit, OnChanges, OnDestroy {
    private trigger$: BehaviorSubject<string> = new BehaviorSubject('');
    private unSubs$: Subject<any> = new Subject();
    @Output() formStatusChange: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();
    @Output() formValueChange: EventEmitter<CatalogueVisibility> = new EventEmitter<CatalogueVisibility>();

    catalogueContent: {
        'content-card': boolean;
        'mt-16': boolean;
        'sinbad-content': boolean;
        'mat-elevation-z1': boolean;
        'fuse-white': boolean;
    };

    formClass: {
        'custom-field-right': boolean;
        'view-field-right': boolean;
    };

    formModeValue: IFormMode = 'add';

    form: FormGroup;

    @Input()
    get formMode(): IFormMode {
        return this.formModeValue;
    }

    set formMode(mode: IFormMode) {
        this.formModeValue = mode;
        this.formModeChange.emit(this.formModeValue);
    }

    @Output()
    formModeChange: EventEmitter<IFormMode> = new EventEmitter<IFormMode>();

    constructor(
        private fb: FormBuilder,
        private catalogueFacade: CatalogueFacadeService,
        private errorMessageService: ErrorMessageService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            status: [
                'active',
                [
                    RxwebValidators.required({
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    }),
                ],
            ],
            isBonus: [
                false,
                [
                    RxwebValidators.required({
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    }),
                ],
            ],
        });

        if (this.formMode === 'edit' || this.formMode === 'view') {
            this._patchForm();
            this.form.statusChanges.pipe(
                debounceTime(250),
                // map(() => this.form.status),
                tap(value => HelperService.debug('CATALOGUE VISIBILITY SETTING FORM STATUS CHANGED:', value)),
                takeUntil(this.unSubs$)
            ).subscribe((status: FormStatus) => {
                this.formStatusChange.emit(status);
            });

            this.form.valueChanges.pipe(
                debounceTime(250),
                // map(() => this.form.getRawValue()),
                tap(value => HelperService.debug('[BEFORE MAP] CATALOGUE VISIBILITY SETTINGS FORM VALUE CHANGED', value)),
                map(value => {
                    const formValue = {
                        status: value.status,
                        isBonus: value.isBonus,
                    };
    
                    return formValue;
                }),
                tap(value => HelperService.debug('[AFTER MAP] CATALOGUE VISIBILITY SETTINGS FORM VALUE CHANGED', value)),
                takeUntil(this.unSubs$)
            ).subscribe(value => {
                this.formValueChange.emit(value);
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['formMode']) {
            if (
                (!changes['formMode'].isFirstChange() &&
                    changes['formMode'].currentValue === 'edit') ||
                changes['formMode'].currentValue === 'view'
            ) {
                this.trigger$.next('');
            }
        }
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();
    }

    private _patchForm(): void {
        combineLatest([this.trigger$, this.catalogueFacade.catalogue$])
            .pipe(
                map(([_, catalogue]) => ({ catalogue })),
                filter((item) => !!item),
                takeUntil(this.unSubs$)
            )
            .subscribe(({ catalogue: item }) => {
                const statusCtrl = this.form.get('status');
                const isBonusCtrl = this.form.get('isBonus');
                statusCtrl.setValue(item.status);
                isBonusCtrl.setValue(item.isBonus);

                if (this.formMode === 'view') {
                    statusCtrl.disable({ onlySelf: true });
                } else if (this.formMode === 'edit') {
                    statusCtrl.enable({ onlySelf: true });
                }
            });
    }
}
