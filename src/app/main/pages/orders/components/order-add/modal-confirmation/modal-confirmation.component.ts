import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-oms-order-add-modal-confirmation',
    templateUrl: './modal-confirmation.component.html',
    styleUrls: ['./modal-confirmation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalConfirmationComponent implements OnInit {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }
}
