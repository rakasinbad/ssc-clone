import { Component, Input, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

export interface IInfoData {
    key: string;
    value: any;
}

/**
 *  @author Mufid Jamaluddin
 */
@Component({
    selector: 'app-document-info-detail',
    templateUrl: './doc_info_detail.component.html',
    styleUrls: ['./doc_info_detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class DocumentInfoDetailComponent {
    @Input()
    title: string;

    @Input()
    listInfoData: Array<IInfoData>;

    @Input()
    isLoading;
}
