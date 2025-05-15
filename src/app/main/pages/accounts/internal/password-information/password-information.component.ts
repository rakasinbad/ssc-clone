import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
    templateUrl: './password-information.component.html',
    styleUrls: ['./password-information.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordInformationComponent implements OnInit {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private matDialogRef: MatDialogRef<PasswordInformationComponent>
    ) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }

    onCopyText(): void {
        // Copy the text inside the text field
        navigator.clipboard.writeText(this.data.password);

        // Alert the copied text
        alert('Teks disalin: ' + this.data.password);
    }

    onConfirm(): void {
        this.matDialogRef.close('confirm');
    }
}
