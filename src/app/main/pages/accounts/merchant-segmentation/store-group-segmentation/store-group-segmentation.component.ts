import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { select, Store } from '@ngrx/store';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { MerchantSegmentationFormComponent } from '../merchant-segmentation-form';
import { ISelectedSegment, PayloadStoreGroup, PayloadStoreGroupPatch, StoreGroup } from '../models';
import { StoreGroupActions } from '../store/actions';
import * as fromStoreSegments from '../store/reducers';
import { StoreGroupSelectors } from '../store/selectors';

@Component({
    selector: 'app-store-group-segmentation',
    templateUrl: './store-group-segmentation.component.html',
    styleUrls: ['./store-group-segmentation.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreGroupSegmentationComponent implements OnInit, OnDestroy {
    form: FormGroup;
    maxSegment = 5;
    triggerSegment = [false, false, false, false, false];
    isFromSelector = false;

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        class: 'm-0 mt-4 mb-16',
        title: {
            label: 'Store Group'
        },
        search: {
            active: false
        },
        // add: {
        //     permissions: [],
        // },
        viewBy: {
            list: [
                { id: 'segment-tree', label: 'Segment Tree' }
                // { id: 'store', label: 'Store' }
            ]
        }
        // export: {
        //     permissions: [],
        //     useAdvanced: true,
        //     pageType: ''
        // }
        // import: {
        //     permissions: [''],
        //     useAdvanced: true,
        //     pageType: ''
        // },
    };

    selectedSegment: ISelectedSegment = {
        parentId: null,
        sequence2Id: null,
        sequence3Id: null,
        sequence4Id: null,
        sequence5Id: null,
    }

    isLoading$: Observable<boolean>;
    isLoadingRow$: Observable<boolean>;

    @ViewChild('contentDesc', { static: true }) contentDesc: ElementRef<HTMLParagraphElement>;
    @ViewChildren('inputName') inputName: QueryList<ElementRef<HTMLInputElement>>;

    private _items: Array<StoreGroup> = [];
    private _unSubs$: Subject<void> = new Subject();

    constructor(
        private cdRef: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private matDialog: MatDialog,
        private store: Store<fromStoreSegments.FeatureState>
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    addSegment(): void {
        this.segments().push(this._createSegments());
    }

    deleteSegment(idx: number): void {
        this.segments().removeAt(idx);
    }

    segments(): FormArray {
        return this.form.get('segments') as FormArray;
    }

    addSegmentBranch(idx: number, isSelector?: boolean): void {
        this.segmentBranches(idx).push(this._createBranches());
        this.triggerSegment[idx] = true;

        if (!isSelector) {
            // Re render view for updating inputName list;
            this.cdRef.detectChanges();

            const segments = this.segments().getRawValue();
            const branchIds =
                segments[idx].branches && segments[idx].branches.length > 0
                    ? segments[idx].branches.map(branch => branch.id)
                    : [];
            const branchIdx = branchIds.lastIndexOf(null);

            if (branchIdx !== -1) {
                this.onFocus(idx, branchIdx);
            }
        }
    }

    deleteSegmentBranch(segmentIdx: number, branchIdx: number): void {
        this.segmentBranches(segmentIdx).removeAt(branchIdx);
    }

    segmentBranches(idx: number): FormArray {
        return this.form.get(['segments', idx, 'branches']) as FormArray;
    }

    generateSelected(): string {
        const formValue = this.form.getRawValue();
        const segments = formValue.segments
            .map(segmentItem => {
                if (
                    segmentItem.selectedId &&
                    segmentItem.branches &&
                    segmentItem.branches.length > 0
                ) {
                    const branches = segmentItem.branches
                        .filter(branchItem => branchItem.id === segmentItem.selectedId)
                        .map(branchItem => branchItem.name);

                    if (branches.length > 0) {
                        return branches;
                    }

                    return null;
                }

                return null;
            })
            .filter(item => item);

        return segments.length > 0 ? segments.join(' > ') : '-';
    }

    getStatus(segmentIdx: number, branchIdx: number): string {
        return this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'statusItem']).value;
    }

    hasBranchName(segmentIdx: number, branchIdx: number): any {
        return this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'name']).value;
    }

    hasChild(segmentIdx: number, branchIdx: number): boolean {
        return !!this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'hasChild']).value;
    }

    handleEvent(segmentIdx: number, branchIdx: number): void {
        this.triggerSegment[segmentIdx] = false;

        if (!this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'name']).value) {
            this.deleteSegmentBranch(segmentIdx, branchIdx);
            return;
        }

        const selectedIdx = segmentIdx > 0 ? segmentIdx - 1 : segmentIdx;
        const selectedId = this.form.get(['segments', selectedIdx, 'selectedId']).value;

        this.form
            .get(['segments', segmentIdx, 'branches', branchIdx, 'parentId'])
            .setValue(selectedId);

        this.form
            .get(['segments', segmentIdx, 'branches', branchIdx, 'sequence'])
            .setValue(segmentIdx + 1);

        this.form
            .get(['segments', segmentIdx, 'branches', branchIdx, 'status'])
            .setValue('readonly');

        // this._resetSegment(segmentIdx); // reset segment (level auto close)

        // this.form.get(['segments', segmentIdx, 'selectedId']).reset();

        this.cdRef.markForCheck();

        setTimeout(() => {
            this._onSubmit(segmentIdx, branchIdx);
        });
    }

    handleRename(segmentIdx: number, branchIdx: number): void {
        this.triggerSegment[segmentIdx] = false;

        if (!this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'name']).value) {
            this.deleteSegmentBranch(segmentIdx, branchIdx);
            return;
        }

        const selectedIdx = segmentIdx > 0 ? segmentIdx - 1 : segmentIdx;
        const selectedId = this.form.get(['segments', selectedIdx, 'selectedId']).value;

        this.form
            .get(['segments', segmentIdx, 'branches', branchIdx, 'parentId'])
            .setValue(selectedId);

        this.form
            .get(['segments', segmentIdx, 'branches', branchIdx, 'sequence'])
            .setValue(segmentIdx + 1);

        this.form
            .get(['segments', segmentIdx, 'branches', branchIdx, 'status'])
            .setValue('readonly');

        // this._resetSegment(segmentIdx); // reset segment (level auto close)

        // this.form.get(['segments', segmentIdx, 'selectedId']).reset();

        this.cdRef.markForCheck();

        setTimeout(() => {
            this._onUpdate(segmentIdx, branchIdx);
        });
    }

    isInactive(segmentIdx: number, branchIdx: number): boolean {
        return (
            this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'statusItem']).value ===
            'inactive'
        );
    }

    isReadonly(segmentIdx: number, branchIdx: number): boolean {
        return (
            this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'status']).value ===
            'readonly'
        );
    }

    isRename(segmentIdx: number, branchIdx: number): boolean {
        return (
            this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'status']).value ===
            'rename'
        );
    }

    isTextTruncateDesc(): boolean {
        const e = this.contentDesc.nativeElement;

        return e.scrollWidth > e.clientWidth;
    }

    isTextTruncate(segmentIdx: number, branchIdx: number): boolean {
        if (this.inputName && this.inputName.length > 0) {
            const id = `input-segment-${segmentIdx}-branch-${branchIdx}`;
            const inputIdx = this.inputName
                .toArray()
                .findIndex(input => input.nativeElement.id === id);

            if (inputIdx !== -1) {
                const e = this.inputName.toArray()[inputIdx].nativeElement;
                return e.scrollWidth > e.clientWidth;
            }

            return false;
        }

        return false;
    }

    isTyping(segmentIdx: number, branchIdx: number): boolean {
        return (
            this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'status']).value ===
            'typing'
        );
    }

    isAddDisabled(segmentIdx: number): boolean {
        return this.triggerSegment[segmentIdx];
    }

    isSelected(segmentIdx: number, branchIdx: number): boolean {
        const selectedId = this.form.get(['segments', segmentIdx, 'selectedId']).value;
        const currentId = this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'id'])
            .value;

        return selectedId === currentId;
    }

    lastSegmentHasBranchName(): boolean {
        if (this.segmentBranches(this.segments().length - 1).length > 0) {
            const branches = this.segmentBranches(this.segments().length - 1)
                .getRawValue()
                .filter(v => !!v.name);

            return (
                !!branches.length &&
                !!this.form.get(['segments', this.segments().length - 1, 'selectedId']).value
            );
        }

        return false;
    }

    onEdit(segmentIdx: number, branchIdx: number): void {
        const formValue = this.form.get(['segments', segmentIdx, 'branches', branchIdx]).value;

        const parentId = this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'id']).value;
        const currLastSegment = +this.form.get('lastSegment').value;

        if (segmentIdx >= currLastSegment) {
            this.form.get('lastSegment').patchValue(segmentIdx);
        }

        this.setSequence(segmentIdx, parentId)

        const dialogRef = this.matDialog.open(MerchantSegmentationFormComponent, {
            data: {
                title: 'Segment Branch Information',
                segmentType: 'group',
                form: formValue
            },
            panelClass: 'merchant-segment-form-dialog',
            disableClose: true
        });

        dialogRef
            .afterClosed()
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => {
                // this._resetSegment(segmentIdx); // reset segment (level auto close)
                // this.form.get(['segments', segmentIdx, 'selectedId']).reset();
                this.cdRef.markForCheck();
            });
    }

    onFocus(segmentIdx: number, branchIdx: number): void {
        const id = `input-segment-${segmentIdx}-branch-${branchIdx}`;
        const inputIdx = this.inputName.toArray().findIndex(input => input.nativeElement.id === id);

        if (inputIdx !== -1) {
            setTimeout(() => {
                this.inputName.toArray()[inputIdx].nativeElement.focus();
                this.cdRef.markForCheck();
            });
        }
    }

    onRename(segmentIdx: number, branchIdx: number): void {
        this.onFocus(segmentIdx, branchIdx);

        this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'status']).setValue('rename');
    }

    setSequence(segmentIdx: number, id: string) {
        switch (segmentIdx) {
            case 1:
                this.selectedSegment.sequence2Id = id
                break;
            case 2:
                this.selectedSegment.sequence3Id = id
                break;
            case 3:
                this.selectedSegment.sequence4Id = id
                break;
            case 4:
                this.selectedSegment.sequence5Id = id
                break;
            default:
                this.selectedSegment = {
                    parentId: id,
                    sequence2Id: null,
                    sequence3Id: null,
                    sequence4Id: null,
                    sequence5Id: null,
                }
                break;
        }
    }

    onShowChild(segmentIdx: number, branchIdx: number): void {
        const parentId = this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'id']).value;
        const currLevel = this.form.get(['segments', segmentIdx, 'level']).value;
        const currLastSegment = +this.form.get('lastSegment').value;

        this.form.get(['segments', segmentIdx, 'selectedId']).setValue(parentId);

        if (segmentIdx >= currLastSegment) {
            this.form.get('lastSegment').patchValue(segmentIdx);
        }

        this.setSequence(segmentIdx, parentId)

        this._resetSegment(segmentIdx);

        this.store
            .pipe(
                select(StoreGroupSelectors.getChild(parentId)),
                // distinctUntilChanged(),
                // delay(300),
                filter(items => items && items.length > 0),
                take(1)
            )
            .subscribe(items => {
                if (!this.form.get(['segments', currLevel])) {
                    this.addSegment();
                }

                this._generateHierarchies(items);
            });
    }

    onSetStatus(segmentIdx: number, branchIdx: number): void {
        const formValue = this.form.get(['segments', segmentIdx, 'branches', branchIdx]).value;

        const parentId = this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'id']).value;
        const currLastSegment = +this.form.get('lastSegment').value;

        if (segmentIdx >= currLastSegment) {
            this.form.get('lastSegment').patchValue(segmentIdx);
        }

        this.setSequence(segmentIdx, parentId)

        this.store.dispatch(
            StoreGroupActions.confirmChangeStatusStoreGroup({
                payload: new StoreGroup({
                    ...formValue,
                    status: formValue.statusItem,
                    description: formValue.desc
                })
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _createBranches(): FormGroup {
        return this.formBuilder.group(
            {
                id: null,
                parentId: null,
                externalId: null,
                sequence: null,
                name: null,
                hasChild: false,
                desc: null,
                statusItem: 'active',
                status: 'typing'
            },
            { updateOn: 'blur' }
        );
    }

    private _createSegments(): FormGroup {
        return this.formBuilder.group({
            selectedId: null,
            level: null,
            branches: this.formBuilder.array([])
        });
    }

    private _generateHierarchies(items: Array<StoreGroup>): void {
        if (items && items.length > 0) {
            this._items = items;
            this.isFromSelector = true;

            const formValue = this.form.getRawValue();

            items.forEach((item, idx) => {
                if (this.segmentBranches(item.sequence - 1).length < items.length) {
                    this.addSegmentBranch(item.sequence - 1, true);
                }

                // Set level control (segments)
                this.form.get(['segments', item.sequence - 1, 'level']).setValue(item.sequence);

                // Set id control (branches)
                this.form
                    .get(['segments', item.sequence - 1, 'branches', idx, 'id'])
                    .setValue(item.id);

                // Set parentId control (branches)
                this.form
                    .get(['segments', item.sequence - 1, 'branches', idx, 'parentId'])
                    .setValue(item.parentId);

                // Set externalId control (branches)
                this.form
                    .get(['segments', item.sequence - 1, 'branches', idx, 'externalId'])
                    .setValue(item.externalId);

                // Set sequence control (branches)
                this.form
                    .get(['segments', item.sequence - 1, 'branches', idx, 'sequence'])
                    .setValue(item.sequence);

                // Set name control (branches)
                this.form
                    .get(['segments', item.sequence - 1, 'branches', idx, 'name'])
                    .setValue(item.name);

                const hasChild = item.hasChild
                    ? Array.isArray(item.children) && item.children.length > 0 && item.hasChild
                    : item.hasChild;

                // Set hasChild control (branches)
                this.form
                    .get(['segments', item.sequence - 1, 'branches', idx, 'hasChild'])
                    .setValue(hasChild);

                // Set desc control (branches)
                this.form
                    .get(['segments', item.sequence - 1, 'branches', idx, 'desc'])
                    .setValue(item.description);

                // Set statusItem control (branches)
                this.form
                    .get(['segments', item.sequence - 1, 'branches', idx, 'statusItem'])
                    .setValue(item.status);

                // Set status control (branches)
                this.form
                    .get(['segments', item.sequence - 1, 'branches', idx, 'status'])
                    .setValue(item.status);

                this.triggerSegment[item.sequence - 1] = false;

                if (
                    !this.form.get(['segments', item.sequence - 1, 'branches', idx, 'name']).value
                ) {
                    this.deleteSegmentBranch(item.sequence - 1, idx);
                    return;
                }

                if (item.status === 'active') {
                    this.form
                        .get(['segments', item.sequence - 1, 'branches', idx, 'status'])
                        .setValue('readonly');
                }

                if (formValue.lastSegment > 0) {
                    const itemSegments = formValue.segments[formValue.lastSegment - 1];

                    if (hasChild) {
                        
                        // >= second run after update generate level 2 to 3, 3 to 4, 4 to 5
                        if (itemSegments.level >= 2 && item.sequence >= 2) {
                            // 2 to 3
                            if (item.sequence === 2 && item.id === this.selectedSegment.sequence2Id) {
                                this._generateHierarchies(item.children)
                            }
                            // 3 to 4
                            if (itemSegments.level >= 3 && item.sequence === 3) {
                                if (item.id === this.selectedSegment.sequence3Id) {
                                    this ._generateHierarchies(item.children)
                                }
                            }
                            // 4 to 5
                            if (itemSegments.level >= 4 && item.sequence === 4) {
                                if (item.id === this.selectedSegment.sequence4Id) {
                                    this._generateHierarchies(item.children)
                                }
                            }
                        } else {
                            // first init/run
                            // 1 to 2
                            if (item.id === this.selectedSegment.parentId) {
                                this._generateHierarchies(item.children);
                            }
                        }
                    }
                }
            });
        } else {
            this._items = [];
        }
    }

    private _resetSegment(currentSegment: number): void {
        let lastSegment = +this.form.get('lastSegment').value;

        lastSegment =
            this.segments().length > lastSegment ? this.segments().length - 1 : lastSegment;

        while (lastSegment > currentSegment) {
            this.deleteSegment(lastSegment);
            lastSegment--;
        }

        this.form.get('lastSegment').setValue(currentSegment);
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                // Reset core state storeGroups
                this.store.dispatch(StoreGroupActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this._initHierarchy();
                this._initForm();

                this.isLoading$ = this.store.select(StoreGroupSelectors.getIsLoading);
                this.isLoadingRow$ = this.store.select(StoreGroupSelectors.getIsLoadingRow);

                this.store.dispatch(StoreGroupActions.clearTableState());

                // Trigger refresh
                this.store
                    .select(StoreGroupSelectors.getIsRefresh)
                    .pipe(
                        filter(v => !!v),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe(() => this._onRefreshHierarchy());
                break;
        }
    }

    private _initForm(): void {
        this.form = this.formBuilder.group({
            lastSegment: null,
            segments: this.formBuilder.array([this._createSegments()])
        });

        this.store
            .select(StoreGroupSelectors.selectAll)
            .pipe(
                // delay(300),
                filter(items => items && items.length > 0),
                takeUntil(this._unSubs$)
            )
            .subscribe(items => {
                this._generateHierarchies(items);
            });
    }

    private _initHierarchy(): void {
        const data: IQueryParams = {
            paginate: false
        };

        this.store.dispatch(StoreGroupActions.fetchStoreGroupsRequest({ payload: data }));
    }

    private _onRefreshHierarchy(): void {
        const data: IQueryParams = {
            paginate: false
        };

        this.store.dispatch(StoreGroupActions.refreshStoreGroupsRequest({ payload: data }));
    }

    private _onSubmit(segmentIdx: number, branchIdx: number): void {
        const isValid = this.form.get(['segments', segmentIdx, 'branches', branchIdx]).valid;
        const body = this.form.getRawValue();
        let parentId = body.segments[segmentIdx].branches[branchIdx].parentId;

        const parentIdx = body.segments[segmentIdx].branches.findIndex(
            branch => branch.id === parentId
        );

        const sequence = +body.segments[segmentIdx].branches[branchIdx].sequence

        // Set parentId null if have same id in current segment;
        if (parentIdx !== -1 || sequence === 1) {
            parentId = null;
        }

        if ((!isValid && !body.segments[segmentIdx].selectedId) || !isValid) {
            this.form
                .get(['segments', segmentIdx, 'branches', branchIdx, 'status'])
                .setValue('readonly');
            return;
        }

        const payload = new PayloadStoreGroup({
            supplierId: null,
            parentId,
            sequence,
            name: body.segments[segmentIdx].branches[branchIdx].name
        });

        this.store.dispatch(StoreGroupActions.createStoreGroupRequest({ payload }));
    }

    private _onUpdate(segmentIdx: number, branchIdx: number): void {
        const isValid = this.form.get(['segments', segmentIdx, 'branches', branchIdx]).valid;
        const formBranch = this.form.get(['segments', segmentIdx, 'branches', branchIdx]);
        const formValue = this.form.get(['segments', segmentIdx, 'branches', branchIdx]).value;

        if (!isValid || !formValue.id || formBranch.pristine) {
            this.form
                .get(['segments', segmentIdx, 'branches', branchIdx, 'status'])
                .setValue('readonly');
            return;
        }

        const payload = {
            name: formValue.name || null
        };

        const itemIdx = this._items.findIndex(item => item.id === formValue.id);

        if (itemIdx !== -1) {
            const item = this._items[itemIdx];

            if (item.name === payload.name) {
                delete payload.name;
            }
        }

        if (Object.keys(payload).length > 0) {
            this.store.dispatch(
                StoreGroupActions.updateStoreGroupRequest({
                    payload: { body: new PayloadStoreGroupPatch(payload), id: formValue.id }
                })
            );
        } else {
            this.form
                .get(['segments', segmentIdx, 'branches', branchIdx, 'status'])
                .setValue('readonly');
        }
    }
}
