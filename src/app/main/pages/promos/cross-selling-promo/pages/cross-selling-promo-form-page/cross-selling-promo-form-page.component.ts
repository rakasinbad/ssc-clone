import { Location } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormStatus } from 'app/shared/models';
import { IBreadcrumbs, IFooterActionConfig } from 'app/shared/models/global.model';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import {
    BenefitFormDto,
    CreateFormDto,
    GeneralInfoFormDto,
    GroupFormDto,
    SegmentSettingFormDto,
} from '../../models';
import { CrossSellingPromoFacadeService, CrossSellingPromoFormService } from '../../services';
@Component({
    templateUrl: './cross-selling-promo-form-page.component.html',
    styleUrls: ['./cross-selling-promo-form-page.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CrossSellingPromoFormPageComponent implements OnInit, AfterViewInit, OnDestroy {
    private breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Promo',
        },
        {
            title: 'Cross Selling Promo',
        },
        {
            title: 'Add Cross Selling Promo',
            active: true,
        },
    ];

    private footerConfig: IFooterActionConfig = {
        progress: {
            title: {
                label: 'Skor tambah toko',
                active: false,
            },
            value: {
                active: false,
            },
            active: false,
        },
        action: {
            save: {
                label: 'Save',
                active: true,
            },
            draft: {
                label: 'Save Draft',
                active: false,
            },
            cancel: {
                label: 'Cancel',
                active: true,
            },
        },
    };

    private benefitSettingFormStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject('INVALID');
    private generalInfoFormStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject('INVALID');
    private groupSettingFormStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject('INVALID');
    private segmentSettingFormStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject('INVALID');
    private unSubs$: Subject<any> = new Subject();

    fakturName: string = null;
    fakturId: string = null;
    segmentationSelectId: string = null;
    form: FormGroup;
    benefitFormDto: BenefitFormDto;
    generalInfoFormDto: GeneralInfoFormDto;
    groupFormDto: GroupFormDto;
    segmentFormDto: SegmentSettingFormDto;

    constructor(
        private location: Location,
        private crossSellingPromoFacade: CrossSellingPromoFacadeService,
        private crossSellingPromoFormService: CrossSellingPromoFormService
    ) {}

    ngOnInit() {
        this.crossSellingPromoFacade.createBreadcrumb(this.breadCrumbs);
        this.crossSellingPromoFacade.setFooterConfig(this.footerConfig);
        this.crossSellingPromoFacade.setCancelButton();
        this.crossSellingPromoFacade.getInvoiceGroup();

        this.form = this.crossSellingPromoFormService.createForm();
        // Handle valid or invalid form status for footer action (SHOULD BE NEEDED)
        this._setFormStatus();

        // Handle cancel button action (footer)
        this.crossSellingPromoFacade.clickCancelBtn$
            .pipe(
                filter((isClick) => !!isClick),
                takeUntil(this.unSubs$)
            )
            .subscribe((_) => {
                this.location.back();

                this.crossSellingPromoFacade.resetCancelBtn();
            });

        // Handle save button action (footer)
        this.crossSellingPromoFacade.clickSaveBtn$
            .pipe(
                filter((isClick) => !!isClick),
                takeUntil(this.unSubs$)
            )
            .subscribe((_) => {
                this._onSubmit();
            });
    }

    ngAfterViewInit(): void {
        this.crossSellingPromoFacade.showFooter();
    }

    ngOnDestroy(): void {
        this.crossSellingPromoFacade.clearBreadcrumb();
        this.crossSellingPromoFacade.resetAllFooter();
        this.crossSellingPromoFacade.hideFooter();

        this.unSubs$.next();
        this.unSubs$.complete();
    }

    onSetBenefitSettingFormStatus(status: FormStatus): void {
        this.benefitSettingFormStatus$.next(status);
    }

    onSetGeneralInfoFormStatus(status: FormStatus): void {
        this.generalInfoFormStatus$.next(status);
    }

    onSetGroupSettingFormStatus(status: FormStatus): void {
        this.groupSettingFormStatus$.next(status);
    }

    onSetSegmentSettingFormStatus(status: FormStatus): void {
        this.segmentSettingFormStatus$.next(status);
    }

    private _onSubmit(): void {
        if (this.form.invalid) {
            return;
        }
        
        // if(this.segmentFormDto.target !== 'store') {
        //     this.segmentFormDto['dataTarget']['warehouseId'] = this.groupFormDto.dataTarget.warehouseId;
        // }
        const payload: CreateFormDto = {
            base: 'sku',
            supplierId: null,
            type: 'cross_selling',
            status: 'active',
            conditions: [{ ...this.benefitFormDto }],
            ...this.generalInfoFormDto,
            ...this.groupFormDto,
            ...this.segmentFormDto,
        };
        this.crossSellingPromoFacade.create(payload);
    }

    private _setFormStatus(): void {
        combineLatest([
            this.generalInfoFormStatus$,
            this.groupSettingFormStatus$,
            this.benefitSettingFormStatus$,
            this.segmentSettingFormStatus$,
        ])
            .pipe(takeUntil(this.unSubs$))
            .subscribe((statuses) => {
                    if (statuses.every((status) => status === 'VALID')) {
                        this.crossSellingPromoFacade.setFormValid();
                    } else {
                        this.crossSellingPromoFacade.setFormInvalid();
                    }
            });
    }
}
