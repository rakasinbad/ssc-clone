import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { LifecyclePlatform } from 'app/shared/models/global.model';

import {
    PayloadStoreChannelPatch,
    PayloadStoreClusterPatch,
    PayloadStoreGroupPatch,
    PayloadStoreTypePatch
} from '../models';
import {
    StoreChannelActions,
    StoreClusterActions,
    StoreGroupActions,
    StoreTypeActions
} from '../store/actions';
import * as fromStoreSegments from '../store/reducers';

@Component({
    selector: 'app-merchant-segmentation-form',
    templateUrl: './merchant-segmentation-form.component.html',
    styleUrls: ['./merchant-segmentation-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantSegmentationFormComponent implements OnInit {
    form: FormGroup;
    dialogTitle: string;
    segmentType: string;
    initForm: any;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private matDialog: MatDialogRef<MerchantSegmentationFormComponent>,
        private store: Store<fromStoreSegments.FeatureState>,
        private _$errorMessage: ErrorMessageService
    ) {
        this.dialogTitle = this.data.title;
        this.segmentType = this.data.segmentType ? `Store ${this.data.segmentType}` : null;
        this.initForm = Object.keys(this.data.form).length > 0 ? this.data.form : null;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getErrorMessage(field: string): string {
        if (field) {
            const { errors } = this.form.get(field);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        }
    }

    hasError(field: string, isMatError = false): boolean {
        if (!field) {
            return;
        }

        const errors = this.form.get(field).errors;
        const touched = this.form.get(field).touched;
        const dirty = this.form.get(field).dirty;

        if (isMatError) {
            return errors && (dirty || touched);
        }

        return errors && ((touched && dirty) || touched);
    }

    hasLength(field: string, minLength: number): boolean {
        if (!field || !minLength) {
            return;
        }

        const value = this.form.get(field).value;

        return !value ? false : value.length <= minLength;
    }

    onSubmit(): void {
        if (this.form.invalid || !this.initForm.id) {
            return;
        }

        const body = this.form.getRawValue();

        switch (this.data.segmentType) {
            case 'channel':
                {
                    const payload = {
                        externalId: body.branchId || null,
                        name: body.branchName || null,
                        description: body.desc || null
                    };

                    if (this.initForm.externalId === payload.externalId) {
                        delete payload.externalId;
                    }

                    if (this.initForm.name === payload.name) {
                        delete payload.name;
                    }

                    if (this.initForm.desc === payload.description) {
                        delete payload.description;
                    }

                    if (Object.keys(payload).length > 0) {
                        this.store.dispatch(
                            StoreChannelActions.updateStoreChannelRequest({
                                payload: {
                                    body: new PayloadStoreChannelPatch(payload),
                                    id: body.id
                                }
                            })
                        );
                    }
                }
                break;

            case 'cluster':
                {
                    const payload = {
                        externalId: body.branchId || null,
                        name: body.branchName || null,
                        description: body.desc || null
                    };

                    if (this.initForm.externalId === payload.externalId) {
                        delete payload.externalId;
                    }

                    if (this.initForm.name === payload.name) {
                        delete payload.name;
                    }

                    if (this.initForm.desc === payload.description) {
                        delete payload.description;
                    }

                    if (Object.keys(payload).length > 0) {
                        this.store.dispatch(
                            StoreClusterActions.updateStoreClusterRequest({
                                payload: {
                                    body: new PayloadStoreClusterPatch(payload),
                                    id: body.id
                                }
                            })
                        );
                    }
                }
                break;

            case 'group':
                {
                    const payload = {
                        externalId: body.branchId || null,
                        name: body.branchName || null,
                        description: body.desc || null
                    };

                    if (this.initForm.externalId === payload.externalId) {
                        delete payload.externalId;
                    }

                    if (this.initForm.name === payload.name) {
                        delete payload.name;
                    }

                    if (this.initForm.desc === payload.description) {
                        delete payload.description;
                    }

                    if (Object.keys(payload).length > 0) {
                        this.store.dispatch(
                            StoreGroupActions.updateStoreGroupRequest({
                                payload: { body: new PayloadStoreGroupPatch(payload), id: body.id }
                            })
                        );
                    }
                }
                break;

            case 'type':
                {
                    const payload = {
                        externalId: body.branchId || null,
                        name: body.branchName || null,
                        description: body.desc || null
                    };

                    if (this.initForm.externalId === payload.externalId) {
                        delete payload.externalId;
                    }

                    if (this.initForm.name === payload.name) {
                        delete payload.name;
                    }

                    if (this.initForm.desc === payload.description) {
                        delete payload.description;
                    }

                    // console.log('Old Value', this.initForm);
                    // console.log('Update Type', Object.keys(payload).length, payload, body);

                    if (Object.keys(payload).length > 0) {
                        this.store.dispatch(
                            StoreTypeActions.updateStoreTypeRequest({
                                payload: { body: new PayloadStoreTypePatch(payload), id: body.id }
                            })
                        );
                    }
                }
                break;

            default:
                return;
        }

        this.matDialog.close();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                break;

            default:
                this._initForm();
                break;
        }
    }

    private _initForm(): void {
        this.form = this.formBuilder.group({
            id: this.initForm.id,
            branchId: this.initForm.externalId,
            branchName: [
                this.initForm.name,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            desc: this.initForm.desc
        });
    }
}
