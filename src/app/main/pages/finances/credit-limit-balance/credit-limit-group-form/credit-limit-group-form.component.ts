import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-credit-limit-group-form',
    templateUrl: './credit-limit-group-form.component.html',
    styleUrls: ['./credit-limit-group-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditLimitGroupFormComponent implements OnInit {
    form: FormGroup;
    pageType: string;

    constructor(private formBuilder: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        if (this.data.id === 'new') {
            this.pageType = 'new';
        } else {
            this.pageType = 'edit';
        }

        this.form = this.formBuilder.group({
            groupName: [''],
            creditAmount: [''],
            startingBalance: [''],
            segment: [''],
            customerHierarchy: [''],
            termOfPayment: [''],
            geo: this.formBuilder.array([this.createGeoForm()])
        });
    }

    get formGeographics(): FormArray {
        return this.form.get('geo') as FormArray;
    }

    get geoControls(): AbstractControl[] {
        return (this.form.get('geo') as FormArray).controls;
    }

    onAddGeograph(): void {
        this.formGeographics.push(this.createGeoForm());
    }

    onSubmit(action: string): void {
        console.log('Submit', action, this.form);
    }

    private createGeoForm(): FormGroup {
        return this.formBuilder.group({
            geoUnit: [''],
            geoValue: ['']
        });
    }
}
