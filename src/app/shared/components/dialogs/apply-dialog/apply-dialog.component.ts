import { Component, ViewEncapsulation, Inject, TemplateRef, EventEmitter, Output, forwardRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ApplyDialogService } from './services/apply-dialog.service';

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
                title: string;
                template: TemplateRef<any>;
                isApplyEnabled: boolean;
                showApplyButton?: boolean;
                showCloseButton?: boolean;
                applyValue?: string;
                closeValue?: string;
                applyButtonLabel?: string;
                closeButtonLabel?: string;
                contentClass?: Array<string>;
                handleEventManually?: boolean;
                context?: T;
                service?: ApplyDialogService<T>;
            },
    ) {}

    onApply(): void {
        if (!this.matDialogRef) {
            return;
        }

        const { applyValue, handleEventManually } = this.data;

        if (handleEventManually) {
            this.data.service._apply();
        } else {
            this.matDialogRef.close(applyValue);
        }
    }

    onClose(): void {
        if (!this.matDialogRef) {
            return;
        }

        const { closeValue, handleEventManually } = this.data;

        if (handleEventManually) {
            this.data.service._close();
        } else {
            this.matDialogRef.close(closeValue);
        }
    }
}
