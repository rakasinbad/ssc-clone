import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
// import { MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormArray, FormBuilder, FormControl, } from '@angular/forms';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { PromoHierarchyLayer } from 'app/shared/models/promo-hierarchy.model';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
import {
    MAT_DIALOG_DATA, MatDialogRef
} from '@angular/material';
import { Store as NgRxStore } from '@ngrx/store';
import { FeatureState as PromoHierarchyCoreState } from '../../store/reducers';
import { PromoHierarchyActions } from '../../store/actions';

@Component({
  selector: 'app-set-promo-hierarchy',
  templateUrl: './set-promo-hierarchy.component.html',
  styleUrls: ['./set-promo-hierarchy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetPromoHierarchyComponent implements OnInit {
    form: FormGroup;
    selectLayer: any;
    layerBase = this._$helperService.promoHierarchyLayer();
    eLayerBase = PromoHierarchyLayer;
        constructor(
            @Inject(MAT_DIALOG_DATA) public data: any,  
        private matDialog: MatDialogRef<SetPromoHierarchyComponent>,
            private fb: FormBuilder,
            private _$errorMessage: ErrorMessageService,
            private _$helperService: HelperService,
            private PromoHierarchyStore: NgRxStore<PromoHierarchyCoreState>
        ) {}
  
    ngOnInit(): void {
        console.log('isi this.data->', this.data)
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
            group: 'this.data.group'
        });

        console.log('isi form->', this.form)
        // if (this.data.layer == 0) {
        //     this.form.setValue()
        // }
        this.selectLayer = this.data.layer;
        // console.log('isi data set promo->', this.data)
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        // this.item = this.data;
    }

    onSubmit(): void {
        let { layer, group } = this.form.getRawValue();
        
        if (layer == 'nol') {
            layer = 0;
        } else if (layer == 'one') {
            layer = 1;
        } else if (layer == 'two') {
            layer = 2;
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
        console.log('data param set->', data)
        this.PromoHierarchyStore.dispatch(
            PromoHierarchyActions.updatePromoHierarchyRequest({
                payload: {
                    body: data
                },
            })
        );
       
        // this.matDialog.close({
        //    id: null,
        //    name: this.data[0].name,
        //     layer,
        //     group
        // })
    }

}
