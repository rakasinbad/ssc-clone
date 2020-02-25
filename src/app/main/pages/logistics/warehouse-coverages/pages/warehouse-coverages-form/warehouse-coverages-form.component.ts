import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';
import { ErrorMessageService } from 'app/shared/helpers';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { MatSelect } from '@angular/material';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-warehouse-coverages-form',
    templateUrl: './warehouse-coverages-form.component.html',
    styleUrls: ['./warehouse-coverages-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseCoveragesFormComponent implements OnInit, AfterViewInit {

    // Form
    form: FormGroup;

    // Warehouse Dropdown
    @ViewChild('warehouse', { static: false }) invoiceGroup: MatSelect;
    warehouseSub: Subject<string> = new Subject<string>();

    // Subject for subscription
    subs$: Subject<void> = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private errorMessageSvc: ErrorMessageService,
    ) { }

    getFormError(form: any): string {
        // console.log('get error');
        return this.errorMessageSvc.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
        // console.log('check error');
        const { ignoreTouched, ignoreDirty } = args;

        if (ignoreTouched && ignoreDirty) {
            return !!form.errors;
        }

        if (ignoreDirty) {
            return (form.errors || form.status === 'INVALID') && form.touched;
        }

        if (ignoreTouched) {
            return (form.errors || form.status === 'INVALID') && form.dirty;
        }

        return (form.errors || form.status === 'INVALID') && (form.dirty || form.touched);
    }

    ngOnInit(): void {
        // Inisialisasi form.
        this.form = this.fb.group({
            warehouse: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            province: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            city: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            district: [[]],
        });
    }

    ngAfterViewInit(): void {
        // this.warehouseSub.pipe(
        //     withLatestFrom(
        //         this.portfolioStore.select(PortfolioSelector.getSelectedInvoiceGroupId),
        //         (formInvoiceGroupId, selectedInvoiceGroupId) => ({ formInvoiceGroupId, selectedInvoiceGroupId })
        //     ),
        //     exhaustMap<{ formInvoiceGroupId: string; selectedInvoiceGroupId: string }, Observable<string | null>>(({ formInvoiceGroupId, selectedInvoiceGroupId }) => {
        //         // Memunculkan dialog ketika di state sudah ada invoice group yang terpilih dan pilihan tersebut berbeda dengan nilai yang sedang dipilih saat ini.
        //         if (selectedInvoiceGroupId && formInvoiceGroupId !== selectedInvoiceGroupId) {
        //             const dialogRef = this.matDialog.open<DeleteConfirmationComponent, any, string | null>(DeleteConfirmationComponent, {
        //                 data: {
        //                     id: `changed|${formInvoiceGroupId}|${selectedInvoiceGroupId}`,
        //                     title: 'Clear',
        //                     message: `It will clear all selected store from the list.
        //                                 It won't affected this portfolio unless you click the save button.
        //                                 Are you sure want to proceed?`,
        //                 }, disableClose: true
        //             });
    
        //             return dialogRef.afterClosed().pipe(
        //                 map(id => {
        //                     if (!id) {
        //                         return `cancelled|${selectedInvoiceGroupId}`;
        //                     }

        //                     return id;
        //                 }),
        //                 take(1)
        //             );
        //         } else {
        //             const subject = new Subject<string>();
        //             let payload;

        //             if (!selectedInvoiceGroupId) {
        //                 payload = `init|${formInvoiceGroupId}`;
        //             } else {
        //                 payload = `cancelled|${selectedInvoiceGroupId}`;
        //             }

        //             return subject.asObservable().pipe(
        //                 startWith(payload),
        //                 take(1)
        //             );
        //         }
        //     }),
        //     filter(invoiceGroupId => {
        //         const action = invoiceGroupId.split('|')[0];
    
        //         if (action === 'cancelled') {
        //             const lastInvoiceGroupId = invoiceGroupId.split('|')[1];
        //             this.invoiceGroup.value = lastInvoiceGroupId;

        //             return false;
        //         } else if (action === 'init' || action === 'changed') {
        //             const formInvoiceGroupId = invoiceGroupId.split('|')[1];
        //             this.portfolioStore.dispatch(PortfolioActions.setSelectedInvoiceGroupId({ payload: formInvoiceGroupId }));

        //             return true;
        //         }

        //         return false;
        //     }),
        //     withLatestFrom(
        //         this.portfolioStore.select(PortfolioStoreSelector.getPortfolioNewStores),
        //         this.portfolioStore.select(PortfolioStoreSelector.getAllPortfolioStores),
        //         (_, newStores, portfolioStores) => ({ newStores, portfolioStores })
        //     ),
        //     map<{ newStores: Array<Store>; portfolioStores: Array<Store> }, any>(({ newStores, portfolioStores }) => {
        //         let isCleared = false;
        //         const newStoreIds = newStores.map(newStore => newStore.id);
        //         const portfolioStoreIds = portfolioStores.map(portfolioStore => portfolioStore.id);

        //         if (newStoreIds.length > 0) {
        //             isCleared = true;
        //             this.portfolioStore.dispatch(
        //                 PortfolioActions.removeSelectedStores({
        //                     payload: newStoreIds
        //                 })
        //             );
        //         }

        //         if (portfolioStoreIds.length > 0) {
        //             isCleared = true;
        //             this.portfolioStore.dispatch(
        //                 PortfolioActions.markStoresAsRemovedFromPortfolio({
        //                     payload: portfolioStoreIds
        //                 })
        //             );
        //         }

        //         return isCleared;
        //     }),
        //     tap((isCleared) => {
        //         // Hanya memunculkan notifikasi jika memang ada store yang terhapus.
        //         if (isCleared) {
        //             this._notice.open('All selected stores have been cleared.', 'info', { verticalPosition: 'bottom', horizontalPosition: 'right' });
        //         }
        //     }),
        //     takeUntil(this.subs$)
        // ).subscribe();
    }

}
