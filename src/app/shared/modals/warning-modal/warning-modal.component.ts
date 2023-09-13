import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';

@Component({
    templateUrl: './warning-modal.component.html',
    styleUrls: ['./warning-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarningModalComponent implements OnInit {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private router: Router,
        private _location: Location
    ) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }

    onCancel() {
        if (this.data && this.data.url) {
            return this.router.navigateByUrl(this.data.url);
        }
    }
}
