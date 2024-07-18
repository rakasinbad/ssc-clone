import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    templateUrl: './resend-store-dialog.component.html',
    styleUrls: ['./resend-store-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ResendStoreDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private matDialogRef: MatDialogRef<ResendStoreDialogComponent>
    ) {}

    onConfirm(): void {
        this.matDialogRef.close('confirm');
    }
}
