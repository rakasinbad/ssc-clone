// import {
//     ChangeDetectionStrategy,
//     ChangeDetectorRef,
//     Component,
//     ComponentFactoryResolver,
//     OnDestroy,
//     OnInit,
//     ViewChild,
//     ViewEncapsulation
// } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { fuseAnimations } from '@fuse/animations';
// import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
// import { select, Store } from '@ngrx/store';
// import { IFormGroup, RxFormBuilder } from '@rxweb/reactive-form-validators';
// import { ContentDirective } from 'app/shared/directives/content.directive';
// import { FieldConfig } from 'app/shared/models/field.model';
// import * as moment from 'moment';
// import { Observable, Subject } from 'rxjs';
// import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

// import { AccountDetailFormModel } from '../models/account-detail-form.model';
// import { Account, IAccount } from '../models/account.model';
// import * as fromAccount from '../store/reducers/account.reducer';
// import { AccountSelectors } from '../store/selectors';

// @Component({
//     selector: 'app-account-detail',
//     templateUrl: './account-detail.component.html',
//     styleUrls: ['./account-detail.component.scss'],
//     animations: fuseAnimations,
//     encapsulation: ViewEncapsulation.None,
//     changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class AccountDetailComponent implements OnInit, OnDestroy {
//     account: Account;
//     form: IFormGroup<AccountDetailFormModel>;
//     pageType: string;
//     displayedColumns: ['id', 'name'];
//     displayedAttendancesColumns = ['id', 'checkIn', 'checkOut', 'date', 'workingHours'];
//     markerOptions = {
//         fontSize: '12px'
//     };
//     templateFor: string;
//     filterConfig = [
//         {
//             id: 'is-not-empty',
//             label: 'Is Not Empty',
//             config: {
//                 showValue: false
//             }
//         },
//         {
//             id: 'is-empty',
//             label: 'Is Empty',
//             config: {
//                 showValue: false
//             }
//         },
//         {
//             id: 'is-contains',
//             label: 'Is Contains',
//             config: {
//                 showValue: true
//             }
//         }
//     ];
//     filterColumn: FieldConfig[] = [
//         {
//             type: 'time',
//             label: 'Check In',
//             name: 'checkIn'
//         },
//         {
//             type: 'time',
//             label: 'Check Out',
//             name: 'checkOut'
//         }
//     ];

//     @ViewChild(ContentDirective, { static: false }) filterHost: ContentDirective;

//     private _unSubs$: Subject<void>;

//     constructor(
//         private formBuilder: RxFormBuilder,
//         private route: ActivatedRoute,
//         private store: Store<fromAccount.FeatureState>,
//         private _changeDetectionRef: ChangeDetectorRef,
//         private _componentFactoryResolver: ComponentFactoryResolver,
//         private _fuseSidebarService: FuseSidebarService
//     ) {}

//     // -----------------------------------------------------------------------------------------------------
//     // @ Lifecycle hooks
//     // -----------------------------------------------------------------------------------------------------

//     ngOnInit(): void {
//         this._unSubs$ = new Subject<void>();
//         this.initForm();
//         this.store
//             .pipe(
//                 select(x => {
//                     console.log('LIFECYCLE', x);
//                     return x.accounts;
//                 })
//             )
//             .subscribe();
//     }

//     ngOnDestroy(): void {
//         this._unSubs$.next();
//         this._unSubs$.complete();
//     }

//     // -----------------------------------------------------------------------------------------------------
//     // @ Public methods
//     // -----------------------------------------------------------------------------------------------------

//     get account$(): Observable<any> {
//         return this.store.select(AccountSelectors.getSelectedAccount).pipe(
//             distinctUntilChanged(),
//             takeUntil(this._unSubs$)
//         );
//     }

//     onFilterClick(templateFor: string): void {
//         this.templateFor = templateFor;
//         // this._changeDetectionRef.detectChanges();

//         // const filterFactory = this._componentFactoryResolver.resolveComponentFactory(FiltersComponent);
//         // const hostViewContainerRef = this.filterHost.viewContainerRef;

//         // hostViewContainerRef.clear();

//         // const filterComponentRef = hostViewContainerRef.createComponent(filterFactory);
//         // filterComponentRef.instance.onOpenMenu();
//     }

//     onClickMarker(store, i): void {
//         console.log('Store', store, i);
//         this._fuseSidebarService.getSidebar('accountMerchantQuickPanel').toggleOpen();
//     }

//     getDiffTime(
//         startTime: string,
//         endTime: string,
//         units: 'hours' | 'minutes' | 'seconds',
//         precise?: boolean
//     ): number {
//         const startTimeFormat = startTime ? moment(startTime).format('HH:mm:ss') : '';
//         const endTimeFormat = endTime ? moment(endTime).format('HH:mm:ss') : '';
//         const startTimeArr = startTimeFormat ? startTimeFormat.split(':') : [];
//         const endTimeArr = endTimeFormat ? endTimeFormat.split(':') : [];

//         let diffNumber = 0;

//         switch (units) {
//             case 'seconds':
//             case 'minutes':
//             case 'hours':
//                 const startTimeMoment =
//                     startTimeArr.length === 3
//                         ? moment([startTimeArr[0], startTimeArr[1], startTimeArr[2]], 'HH:mm:ss')
//                         : null;
//                 const endTimeMoment =
//                     endTimeArr.length === 3
//                         ? moment([endTimeArr[0], endTimeArr[1], endTimeArr[2]], 'HH:mm:ss')
//                         : null;

//                 if (startTimeMoment && endTimeMoment) {
//                     diffNumber = moment(endTime).diff(moment(startTime), units, precise);
//                 }
//                 break;
//         }

//         return diffNumber;
//     }

//     // -----------------------------------------------------------------------------------------------------
//     // @ Private methods
//     // -----------------------------------------------------------------------------------------------------

//     private initForm(): void {
//         this.form = this.formBuilder.formGroup(AccountDetailFormModel) as IFormGroup<
//             AccountDetailFormModel
//         >;

//         this.form.disable();

//         this.store
//             .select(AccountSelectors.getSelectedAccount)
//             .pipe(
//                 filter(data => (data ? true : false)),
//                 takeUntil(this._unSubs$)
//             )
//             .subscribe(selectedAccount => {
//                 const formModel = new AccountDetailFormModel(selectedAccount);

//                 this.form.patchModelValue(formModel);
//             });
//     }
// }
