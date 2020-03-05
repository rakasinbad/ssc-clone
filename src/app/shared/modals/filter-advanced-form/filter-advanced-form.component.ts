import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-filter-advanced-form',
    templateUrl: './filter-advanced-form.component.html',
    styleUrls: ['./filter-advanced-form.component.scss']
})
export class FilterAdvancedFormComponent implements OnInit {
    filterForm: FormGroup;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private _formBuilder: FormBuilder) {}

    ngOnInit(): void {
        // this.filterForm = this.createForm();

        this.filterForm = this._formBuilder.group({
            filters: this._formBuilder.array([])
        });
    }

    get filterControls(): AbstractControl[] {
        return (this.filterForm.get('filters') as FormArray).controls;
    }

    get formFilters(): FormArray {
        return this.filterForm.get('filters') as FormArray;
    }

    addFilter(): void {
        this.formFilters.push(this.createFilterForm());
    }

    checkOperatorConfig(operatorConfig): boolean {
        return operatorConfig && operatorConfig.config.showValue ? true : false;
    }

    private createFilterForm(): FormGroup {
        return this._formBuilder.group({
            operator: '',
            column: '',
            value: ''
        });
    }

    /* private createForm(): FormGroup {
        const group = this._formBuilder.group({});

        this.data.filterColumn.forEach(field => {
            if (field.type === 'button') {
                return;
            }

            const control = this._formBuilder.control(field.value);
            group.addControl(field.name, control);
        });

        return group;
    } */
}
