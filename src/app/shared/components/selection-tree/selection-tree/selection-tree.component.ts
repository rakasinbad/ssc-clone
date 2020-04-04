/** Angular Core Libraries */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
    OnChanges
} from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { map, takeUntil, debounceTime, tap } from 'rxjs/operators';

import { SelectionTree, SelectedTree, ChildrenOfTree } from './models';
import { HelperService } from 'app/shared/helpers';

@Component({
    selector: 'selection-tree',
    templateUrl: './selection-tree.component.html',
    styleUrls: ['./selection-tree.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class SelectionTreeComponent implements OnInit, OnChanges, OnDestroy {

    // Untuk keperluan subscription.
    private subs$: Subject<void> = new Subject<void>();

    // Untuk mengetahui jumlah level maksimal untuk tree.
    // tslint:disable-next-line: no-inferrable-types
    @Input() maxLevel: number = 2;

    // Untuk data yang akan ditampilkan di komponen ini dan dikembalikan dari komponen ini.
    @Input() entities: Array<SelectionTree> = [];
    @Input() firstLevelEntities: Array<SelectionTree> = [];

    // Untuk event ketika setelah memilih, akan mengembalikan array dari pilihannya.
    @Output() selected: EventEmitter<Array<SelectionTree>> = new EventEmitter<Array<SelectionTree>>();

    // Untuk event ketika setelah memilih, akan mengembalikan SelectionTree pilihan terakhir.
    @Output() selectionChanged: EventEmitter<SelectedTree> = new EventEmitter<SelectedTree>();

    // Untuk menampung anak-anak dari induk tree.
    public childrenOfTree: ChildrenOfTree = {};

    // Untuk menampilkan tree yang telah terpilih dalam string;
    // tslint:disable-next-line: no-inferrable-types
    public selectedString: string = '';
    public selected$: BehaviorSubject<string> = new BehaviorSubject<string>('');

    // Untuk menyimpan yang terakhir kali dipilih.
    private lastSelected$: BehaviorSubject<SelectionTree> = new BehaviorSubject<SelectionTree>(null);

    // Untuk menampilkan tree yang telah terpilih dalam array;
    public selectedTree$: BehaviorSubject<Array<SelectionTree>> = new BehaviorSubject<Array<SelectionTree>>([]);

    // Untuk menampilkan tree yang telah terpilih dalam array dengan tambahan beberapa pipe operator;
    public observerSelectedTree$: Observable<Array<SelectionTree>>;

    /** Untuk penanda bahwa data yang di-input sudah memenuhi kriteria atau belum. */
    public isFulfilled: boolean;

    constructor(
        private cdRef: ChangeDetectorRef,
    ) {
        this.observerSelectedTree$ = this.selectedTree$.asObservable().pipe(
            // debounceTime(100),
            tap((value) => HelperService.debug('selectedTree$ changed', value)),
            tap(() => this.selected$.next(this.selected$.value + ' ')),
            takeUntil(this.subs$)
        );

        this.selected$.asObservable().pipe(
            map(() => this.joinSelectedTrees()),
            tap((value) => HelperService.debug('selected$ changed', value)),
            takeUntil(this.subs$)
        ).subscribe(value => {
            this.selectedString = value;
            this.selectionChanged.emit({ selected: this.lastSelected$.value, selectedString: this.selectedString });
        });

        this.selectedTree$.pipe(
            takeUntil(this.subs$)
        ).subscribe(value => this.selected.emit(value));
    }

    private joinSelectedTrees(): string {
        const selected = this.selectedTree$.value;

        if (selected.length === 0) {
            return '';
        } else {
            // https://stackoverflow.com/a/56181222
            return selected.map(c => c ? `<p class="my-12">${c.name}</p>` : '<p class="my-12">(unknown)</p>')
                        .join('<span class="material-icons font-size-28">chevron_right</span>');
        }
    }
// 
    getEntityByParent(tree: SelectionTree, debug: boolean = true): Array<SelectionTree> {
        const isTreeValid = (tree ? tree.id : null);
        const filterResult = this.entities.filter(entity => entity.parentId === isTreeValid);

        if (debug) {
            HelperService.debug('getEtityByParent', { isTreeValid, tree, filterResult });
        }
        return filterResult;
    }

    isSelected(tree: SelectionTree): boolean {
        const selected = this.selectedTree$.value;
        HelperService.debug('isSelected?', { selected, tree });
        if (!selected[0] || !tree) {
            return false;
        }

        return !!(selected.find(s => s.id === tree.id));
    }
// 
    onSelectTree(selected: SelectionTree, level: number): void {
        this.lastSelected$.next(selected);

        if (level < this.maxLevel) {
            let tempSelected = this.selectedTree$.value;

            tempSelected[level] = selected;
            for (const [idx, temp] of (tempSelected.entries())) {
                if (idx > level) {
                    tempSelected[idx] = null;
                } else {
                    tempSelected[idx] = temp;
                }
            }

            tempSelected = tempSelected.filter(temp => !!temp);
            this.childrenOfTree[selected.id] = this.getEntityByParent(selected, false);
            this.selectedTree$.next(tempSelected);
        }
    }

    ngOnInit(): void { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['entities']) {
            this.firstLevelEntities = (changes['entities'].currentValue as Array<SelectionTree>).filter(entity => entity.parentId === null);
        }
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }
}
