import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-credit-store-form',
    templateUrl: './credit-store-form.component.html',
    styleUrls: ['./credit-store-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditStoreFormComponent implements OnInit {
    form: FormGroup;

    constructor(private formBuilder: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.form = this.formBuilder.group({
            limit: [''],
            balance: [''],
            top: ['']
        });
    }
}
