import { Component, ViewEncapsulation, Input } from '@angular/core';

/**
 *  @author Mufid Jamaluddin
 */
@Component({
    selector: 'app-table-row',
    templateUrl: './table_row.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class TableRowComponent {
    /**
     * Row Title
     */
    @Input()
    title: string;

    /**
     * Key in JSON Row Data
     */
    @Input()
    key: any;

    /**
     * Name of Column in Table FE
     */
    @Input()
    columnName: string;
}
