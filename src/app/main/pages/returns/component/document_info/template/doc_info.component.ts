import { Component, Input, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';


/**
 *  @author Mufid Jamaluddin
 */
@Component({
    selector: 'app-document-info',
    templateUrl: './doc_info.component.html',
    styleUrls: ['./doc_info.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class DocumentInfoComponent {
    @Input()
    title: string;
}
