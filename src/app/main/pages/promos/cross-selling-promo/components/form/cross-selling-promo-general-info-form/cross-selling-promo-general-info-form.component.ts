import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange, MatRadioChange } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { fuseAnimations } from '@fuse/animations';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, FileService } from 'app/shared/helpers';
import { FormMode, FormStatus } from 'app/shared/models';
import { PlatformSinbad } from 'app/shared/models/platform.model';
import { PromoAllocation } from 'app/shared/models/promo-allocation.model';
import { isMoment } from 'moment';
import { Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';
import { GeneralInfoFormDto } from '../../../models';
import { CrossSellingPromoFormService } from '../../../services';
import { SkpLinkedList } from 'app/shared/components/dropdowns/select-linked-skp/models/select-linked-skp.model';
import { PromoHierarchyLayer, PromoHierarchyGroup } from 'app/shared/models/promo-hierarchy.model';

type TmpKey = 'imgSuggestion';
@Component({
    selector: 'app-cross-selling-promo-general-info-form',
    templateUrl: './cross-selling-promo-general-info-form.component.html',
    styleUrls: ['./cross-selling-promo-general-info-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrossSellingPromoGeneralInfoFormComponent implements OnInit, OnDestroy {
    private readonly strictISOString: boolean = false;
    private unSubs$: Subject<any> = new Subject();

    platformsSinbad: { id: PlatformSinbad; label: string }[];
    promoAllocation: { id: PromoAllocation; label: string }[];
    layerBase: { id: PromoHierarchyLayer; label: string }[];
    groupBase: { id: PromoHierarchyGroup; label: string }[];
    // groupBase = this._$helperService.promoHierarchyGroup();
    // eGroupBase = PromoHierarchyGroup;
    promoAllocationType = PromoAllocation;
    tmp: Partial<Record<TmpKey, FormControl>> = {
        imgSuggestion: new FormControl({ value: '', disabled: true }),
    };

    promoBudgetLabel: string;
    minStartDate: Date = new Date();
    maxStartDate: Date = null;
    minEndDate: Date = new Date();
    maxEndDate: Date = null;
    errorSkpLinkedList: boolean = true;
    public dateStatus: boolean = true;
    public promoEnd: string;

    @Input()
    form: FormGroup;

    @Input()
    formMode: FormMode;

    @Output()
    formStatus: EventEmitter<FormStatus> = new EventEmitter();

    @Output()
    formValue: EventEmitter<GeneralInfoFormDto> = new EventEmitter();

    constructor(
        private domSanitizer: DomSanitizer,
        private crossSellingPromoFormService: CrossSellingPromoFormService,
        private errorMessageService: ErrorMessageService,
        private fileService: FileService
    ) {}

    ngOnInit() {
        this.platformsSinbad = this.crossSellingPromoFormService.platformsSinbad;
        this.promoAllocation = this.crossSellingPromoFormService.promoAllocation;
        this.layerBase = this.crossSellingPromoFormService.promoHierarchyLayer;
        this.groupBase = this.crossSellingPromoFormService.promoHierarchyGroup;

        this.form.statusChanges
            .pipe(
                map((status) => {
                    const { startDate, endDate } = this.form.getRawValue();

                    if (status === 'VALID' && (!startDate || !endDate)) {
                        return 'INVALID';
                    }

                    return status;
                }),
                takeUntil(this.unSubs$)
            )
            .subscribe((status: FormStatus) => {
                if (status === 'VALID') {
                    this._handleFormValue();
                }

                this.formStatus.emit(status);
            });
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();
    }

    onChangePromoAllocationType(ev: MatRadioChange): void {
        const label = this.promoAllocation.find((item) => item.id === ev.value).label;

        this._clearPromoBudgetValidation();

        if (ev.value === 'promo_slot' || ev.value === 'promo_budget') {
            this.promoBudgetLabel = label;
            this._setPromoBudgetValidation(ev.value);
        } else {
            this.promoBudgetLabel = null;
        }
    }

    onChangeFirstBuy(ev: MatCheckboxChange): void {
        const maxRedemptionCtrl = this.form.get('maxRedemption');

        if (ev.checked) {
            maxRedemptionCtrl.setValue(1);
            maxRedemptionCtrl.disable({ onlySelf: true });
        } else {
            maxRedemptionCtrl.enable({ onlySelf: true });
        }
    }

    onChangeMultiplication(ev: MatCheckboxChange): void {
        const multiplicationCtrl = this.form.get('multiplication');

        if (ev.checked) {
            multiplicationCtrl.setValue(true);
        } else {
            multiplicationCtrl.setValue(false);
        }
    }

    onChangeEndDate(ev: MatDatetimepickerInputEvent<any>): void {
        const endDate = ev.value;
        const startDateCtrl = this.form.get('startDate');
        const startDate = startDateCtrl.value;

        if (startDate) {
            if (endDate.isBefore(startDate)) {
                startDateCtrl.reset();
                this.dateStatus = true;
            }
        }

        this.dateStatus = false;
        this.maxStartDate = endDate.subtract(1, 'minute').toDate();
        this.promoEnd = endDate.toISOString(this.strictISOString);
        this.form.get('skpId').reset();
        this.form.get('skpId').setValue(null);
        this.form.get('skpId').updateValueAndValidity();
    }

    onChangeStartDate(ev: MatDatetimepickerInputEvent<any>): void {
        const startDate = ev.value;
        const endDateCtrl = this.form.get('endDate');
        const endDate = endDateCtrl.value;

        if (endDate) {
            if (startDate.isAfter(endDate)) {
                endDateCtrl.reset();
            }
        }

        this.minEndDate = startDate.add(1, 'minute').toDate();
    }

    /**
     *
     * Handle change event for Select Linked SKP
     * @output bring value select skp
     * @param {event}
     * @returns {void}
     * @memberof FlexiComboFormComponent
     */
    onSelectedSkpLinked(value: SkpLinkedList[]): void {
        if (value == null) {
            this.errorSkpLinkedList = true;
            this.form.get('skpId').setValue(null);
        } else {
            this.errorSkpLinkedList = false;
            let skpSelect = value;
            this.form.get('skpId').setValue(parseInt(value['id']));
        }
    }

    onFileBrowse(ev: Event, type: string): void {
        if (!type) {
            return;
        }

        const inputEl = ev.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];

            const control = this.form.get(type);
            const tmpCtrl = this.tmp[type];

            if (file) {
                this.fileService
                    .readFile(file)
                    .pipe(first())
                    .subscribe((result) => {
                        control.setValue(result);
                        tmpCtrl.setValue({
                            name: file.name,
                            url: this.domSanitizer.bypassSecurityTrustUrl(
                                window.URL.createObjectURL(file)
                            ),
                        });

                        if (control.invalid) {
                            control.markAsTouched();
                        }
                    });
            } else {
                control.reset();
                tmpCtrl.reset();
            }
        }
    }

    private _handleFormValue(): void {
        const body = this.form.getRawValue();
        // Field EndDate
        const endDate = body['endDate'];
        const newEndDate =
            endDate && isMoment(endDate) ? endDate.toISOString(this.strictISOString) : null;

        // Field StartDate
        const startDate = body['startDate'];
        const newStartDate =
            startDate && isMoment(startDate) ? startDate.toISOString(this.strictISOString) : null;

        let layerVal;
        if (body['promoLayer'] == 'nol') {
            layerVal = 0;
        } else if (body['promoLayer'] == 'one') {
            layerVal = 1;
        } else if (body['promoLayer'] == 'two') {
            layerVal = 2;
        } else if (body['promoLayer'] == 'three') {
            layerVal = 3;
        } else if (body['promoLayer'] == 'four') {
            layerVal = 4;
        } else {
            layerVal = 0;
        }

        let groupVal;
        if (body['promoOwner'] == null) {
            groupVal = 'none';
        } else {
            groupVal = body['promoOwner'];
        }

        const payload: GeneralInfoFormDto = {
            promoAllocationType: body['promoAllocationType'],
            externalId: body['promoSellerId'],
            name: body['promoName'],
            platform: body['platform'],
            maxRedemptionPerStore: (body['firstBuy'] ? 1 : +body['maxRedemption']) || null,
            promoSlot:
                (body['promoAllocationType'] === PromoAllocation.PROMOSLOT &&
                    +body['promoBudget']) ||
                null,
            promoBudget:
                (body['promoAllocationType'] === PromoAllocation.PROMOBUDGET &&
                    +body['promoBudget']) ||
                null,
            startDate: newStartDate,
            endDate: newEndDate,
            image: body['imgSuggestion'] || null,
            shortDescription: body['shortDescription'] || null,
            firstBuy: body['firstBuy'] || false,
            multiplication: body['multiplication'] || false,
            skpId: body['skpId'],
            promoLayer: layerVal,
            promoOwner: groupVal,
        };

        this.formValue.emit(payload);
    }

    private _setPromoBudgetValidation(type: PromoAllocation): void {
        this.form.get('promoBudget').reset();

        const validators = [
            RxwebValidators.required({
                message: this.errorMessageService.getErrorMessageNonState('default', 'required'),
            }),
        ];

        if (type === PromoAllocation.PROMOSLOT) {
            validators.push(
                RxwebValidators.digit({
                    message: this.errorMessageService.getErrorMessageNonState('default', 'numeric'),
                }),

                // max length 8 character
                RxwebValidators.maxLength({
                    value: 8,
                    message: this.errorMessageService.getErrorMessageNonState(
                        'default',
                        'max_length',
                        8
                    ),
                })
            );
        } else if (type === PromoAllocation.PROMOBUDGET) {
            validators.push(
                RxwebValidators.numeric({
                    acceptValue: NumericValueType.PositiveNumber,
                    allowDecimal: true,
                    message: this.errorMessageService.getErrorMessageNonState('default', 'pattern'),
                }),

                // max length 12 character
                RxwebValidators.maxLength({
                    value: 12,
                    message: this.errorMessageService.getErrorMessageNonState(
                        'default',
                        'max_length',
                        12
                    ),
                })
            );
        }

        this.form.get('promoBudget').setValidators(validators);
        this.form.get('promoBudget').updateValueAndValidity();
    }

    private _clearPromoBudgetValidation(): void {
        this.form.get('promoBudget').clearValidators();
        this.form.get('promoBudget').updateValueAndValidity();
    }
}
