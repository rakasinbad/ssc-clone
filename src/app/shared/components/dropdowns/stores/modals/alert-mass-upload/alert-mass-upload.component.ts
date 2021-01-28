import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

// export interface DialogData {
//   supplier: string;
//   min_order: number;
//   percent_purchase: number;
//   max_point: number;
// }

@Component({
  selector: 'app-alert-mass-upload',
  templateUrl: './alert-mass-upload.component.html',
  styleUrls: ['./alert-mass-upload.component.scss'],

})
export class AlertMassUploadComponent implements OnInit {
    item: any;
  
    constructor(@Inject(MAT_DIALOG_DATA) private data: any) {
        console.log('isi data->', data)
    }
  
    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        // this.item = this.data;
    }

}
