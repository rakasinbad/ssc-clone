import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormArray, FormBuilder, FormControl, } from '@angular/forms';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';

@Component({
  selector: 'app-set-promo-hierarchy',
  templateUrl: './set-promo-hierarchy.component.html',
  styleUrls: ['./set-promo-hierarchy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetPromoHierarchyComponent implements OnInit {
    form: FormGroup;
    selectLayer: any;
        constructor(
            @Inject(MAT_DIALOG_DATA) public data: any,  
            private fb: FormBuilder,
            private _$errorMessage: ErrorMessageService,
        ) {}
  
    ngOnInit(): void {
        this.form = this.fb.group({
            id: null,
            supplierId: null,
            name: this.data.name,
            layer: this.data.layer,
            group: this.data.group
        });
        this.selectLayer = this.data.layer;
        // console.log('isi data set promo->', this.data)
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        // this.item = this.data;
    }

    onSubmit(): void {

    }

}
