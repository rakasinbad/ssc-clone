import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { CatalogueSegmentationModule } from '../catalogue-segmentation.module';

@Injectable({ providedIn: CatalogueSegmentationModule })
export class CatalogueSegmentationFormService {
    constructor(private fb: FormBuilder, private errorMessageService: ErrorMessageService) {}

    createForm(): FormGroup {
        return this.fb.group({
            segmentationName: [
                null,
                [
                    RxwebValidators.required({
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    }),
                ],
            ],
            chosenWarehouse: [
                null,
                [
                    RxwebValidators.required({
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    }),
                ],
            ],
            chosenStoreType: null,
            chosenStoreGroup: null,
            chosenStoreChannel: null,
            chosenStoreCluster: null,
        });
    }
}
