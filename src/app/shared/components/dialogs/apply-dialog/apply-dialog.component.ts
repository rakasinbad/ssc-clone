import { Component, ViewEncapsulation, Inject, TemplateRef, EventEmitter, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'apply-dialog',
    templateUrl: './apply-dialog.component.html',
    styleUrls: ['./apply-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ApplyDialogComponent<T> {
    @Output() closed: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private matDialogRef: MatDialogRef<ApplyDialogComponent<T>>,
        @Inject(MAT_DIALOG_DATA)
            public data: {
                title: string,
                template: TemplateRef<any>,
                isApplyEnabled: boolean,
                context: T,
            },
    ) {}

    onApply(): void {
        this.matDialogRef.close('apply');
    }

    onClose(): void {
        this.matDialogRef.close(null);
    }
}
