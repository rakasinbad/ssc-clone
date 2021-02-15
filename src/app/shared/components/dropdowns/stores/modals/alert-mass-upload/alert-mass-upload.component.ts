import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-alert-mass-upload',
  templateUrl: './alert-mass-upload.component.html',
  styleUrls: ['./alert-mass-upload.component.scss'],
changeDetection: ChangeDetectionStrategy.OnPush

})
export class AlertMassUploadComponent implements OnInit {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  
    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        // this.item = this.data;
    }

}
