import { Selection } from './selection.model';

export interface SelectionList {
    added: Array<Selection>;
    removed: Array<Selection>;
    merged?: Array<Selection>;
}
