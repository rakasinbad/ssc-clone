import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { assetUrl } from 'single-spa/asset-url';

@Component({
    templateUrl: './show-image.component.html',
    styleUrls: ['./show-image.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowImageComponent implements OnInit {
    // Assets
    sinbadProfileDefault = assetUrl('images/avatars/profile.jpg');
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }
}
