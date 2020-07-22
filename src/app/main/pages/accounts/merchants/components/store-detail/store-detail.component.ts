import { Component, OnInit, ViewEncapsulation, Input, ViewChild, TemplateRef } from '@angular/core';
import { SupplierStore } from 'app/shared/models/supplier.model';
import { ApplyDialogService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog.service';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';
import { HelperService } from 'app/shared/helpers';

@Component({
    selector: 'store-detail-component',
    templateUrl: './store-detail.component.html',
    styleUrls: ['./store-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class StoreDetailComponent implements OnInit {

    @Input() supplierStore: SupplierStore;

    // tslint:disable-next-line: no-inferrable-types
    labelFlex: string = '25';
    // tslint:disable-next-line: no-inferrable-types
    valueFlex: string = 'grow';

    selectedPhoto: string;
    dialogPreviewPhoto: ApplyDialogService;
    @ViewChild('previewPhoto', { static: false }) previewPhoto: TemplateRef<any>;

    constructor(
        private applyDialogFactory$: ApplyDialogFactoryService,
    ) {}

    openPreviewPhoto(url: string, title: string): void {
        this.selectedPhoto = url;
        
        this.dialogPreviewPhoto = this.applyDialogFactory$.open(
            {
                title: `Preview Photo ${title ? '(' + title + ')' : ''}`,
                template: this.previewPhoto,
                isApplyEnabled: false,
                showApplyButton: false,
            },
            {
                disableClose: false,
                width: '80vw',
                minWidth: '80vw',
                maxWidth: '80vw',
                panelClass: 'dialog-container-no-padding'
            }
        );

        this.dialogPreviewPhoto.closed$.subscribe({
            next: () => {
                HelperService.debug('DIALOG PREVIEW PHOTO CLOSED');
            },
        });
    }

    ngOnInit(): void {}
}
