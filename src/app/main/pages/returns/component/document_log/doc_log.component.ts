import { Component, Input, ViewEncapsulation } from '@angular/core';
import { DocumentLogItemViewModel } from './doc_log_item.viewmodel';

/**
 *  @author Mufid Jamaluddin
 */
@Component({
    selector: 'app-document-log',
    templateUrl: './doc_log.component.html',
    styleUrls: ['./doc_log.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class DocumentLogComponent {
    @Input()
    logData: Array<DocumentLogItemViewModel> | null;

    isLastItem(index): boolean {
        if (this.logData == null) {
            return false;
        }
        const lastItemIndex = this.logData.length - 1;
        return index === lastItemIndex;
    }
}
