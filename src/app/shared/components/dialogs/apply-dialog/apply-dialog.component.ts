import { Component, ViewEncapsulation, Inject, TemplateRef, EventEmitter, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
    selector: 'apply-dialog',
    templateUrl: './apply-dialog.component.html',
    styleUrls: ['./apply-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ApplyDialogComponent<T> {
    defaultContentClass: Array<string> = [
        'pt-16', 'px-0', 'm-0', 'mat-typography'
    ];

    @Output() closed: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private matDialogRef: MatDialogRef<ApplyDialogComponent<T>>,
        @Inject(MAT_DIALOG_DATA)
            public data: {
                title: string,
                template: TemplateRef<any>,
                isApplyEnabled: boolean,
                showApplyButton: boolean,
                showCloseButton: boolean,
                applyValue: string,
                closeValue: string,
                contentClass?: Array<string>,
                context: T,
            },
    ) {}

    onApply(): void {
        this.matDialogRef.close(typeof this.data.applyValue !== undefined ? this.data.applyValue : 'apply');
    }

    onClose(): void {
        this.matDialogRef.close(null);
    }
}
