import { ChangeDetectionStrategy, ViewEncapsulation, Component, Inject, OnInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormArray, FormBuilder, FormControl, } from '@angular/forms';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { PromoHierarchyLayer, PromoHierarchyGroup } from 'app/shared/models/promo-hierarchy.model';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Store as NgRxStore } from '@ngrx/store';
import { FeatureState as PromoHierarchyCoreState } from '../../store/reducers';
import { PromoHierarchyActions } from '../../store/actions';

@Component({
  selector: 'app-set-promo-hierarchy',
  templateUrl: './set-promo-hierarchy.component.html',
  styleUrls: ['./set-promo-hierarchy.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
    
})
export class SetPromoHierarchyComponent implements OnInit {
    form: FormGroup;
    selectLayer: any;
    layerBase = this._$helperService.promoHierarchyLayer();
    eLayerBase = PromoHierarchyLayer;
    groupBase = this._$helperService.promoHierarchyGroup();
    eGroupBase = PromoHierarchyGroup;

        constructor(
            @Inject(MAT_DIALOG_DATA) public data: any,  
        private matDialog: MatDialogRef<SetPromoHierarchyComponent>,
            private fb: FormBuilder,
            private _$errorMessage: ErrorMessageService,
            private _$helperService: HelperService,
            private PromoHierarchyStore: NgRxStore<PromoHierarchyCoreState>
        ) {
            
        }
  
    ngOnInit(): void {
        this.form = this.fb.group({
            id: this.data.data.id,
            name: this.data.name,
            layer:  
            [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.oneOf({
                        matchValues: [...this.layerBase.map((v) => v.id)],
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                ],
            ],
            group:  [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.oneOf({
                        matchValues: [...this.layerBase.map((v) => v.id)],
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                ],
            ],
        });

        switch (this.data.layer) {
            case 0:
                this.form.get('layer').setValue('nol');
                break;
            case 1:
                this.form.get('layer').setValue('one');
                break;
            case 2:
                this.form.get('layer').setValue('two');
                break;
            case 3:
                this.form.get('layer').setValue('three');
                break;
            case 4:
                this.form.get('layer').setValue('four');
                break;
        }

        switch (this.data.group) {
            case 'none':
                this.form.get('group').setValue('none');
                break;
            case 'principal-promo':
                this.form.get('group').setValue('principal-promo');
                break;
            case 'distributor-promo':
                this.form.get('group').setValue('distributor-promo');
                break;
            case 'sinbad-promo':
                this.form.get('group').setValue('sinbad-promo');
                break;
            case 'payment-method-prmo':
                this.form.get('group').setValue('payment-method-promo');
                break;
        }
    }

    onSubmit(): void {
        let { layer, group } = this.form.getRawValue();
        
        if (layer == 'nol') {
            layer = 0;
        } else if (layer == 'one') {
            layer = 1;
        } else if (layer == 'two') {
            layer = 2;
        } else if (layer == 'three') {
            layer = 3;
        }  else if (layer == 'four') {
            layer = 4;
        }

        let promoTypes;
        if (this.data.data.promoType == 'cross_selling') {
            promoTypes = 'cross';
        } else {
            promoTypes = this.data.data.promoType;
        }
        
        const data = {
            layer: layer,
            group: group,
            id: this.data.data.id,
            promoType: promoTypes
        };
        this.PromoHierarchyStore.dispatch(
            PromoHierarchyActions.updatePromoHierarchyRequest({
                payload: {
                    body: data
                },
            })
        );
       
    }

}
