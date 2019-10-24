import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    templateUrl: './payment-status-form.component.html',
    styleUrls: ['./payment-status-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentStatusFormComponent implements OnInit {
    form: FormGroup;

    constructor(private formBuilder: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.form = this.formBuilder.group({
            status: [''],
            amount: [''],
            paidDate: [{ value: '', disabled: true }],
            paymentMethod: ['']
        });
    }
}
