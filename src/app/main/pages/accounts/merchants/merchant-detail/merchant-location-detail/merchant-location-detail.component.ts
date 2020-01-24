import { AgmGeocoder, LatLngBounds, MouseEvent } from '@agm/core';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange, MatAutocompleteTrigger, MatAutocomplete } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { SupplierStore, District } from 'app/shared/models';
import { DropdownActions, FormActions, UiActions } from 'app/shared/store/actions';
import { FormSelectors, DropdownSelectors } from 'app/shared/store/selectors';
import { icon } from 'leaflet';
import { Observable, Subject, fromEvent } from 'rxjs';
import { filter, takeUntil, tap, map } from 'rxjs/operators';

import { StoreActions } from '../../store/actions';
import { fromMerchant } from '../../store/reducers';
import { StoreSelectors } from '../../store/selectors';

@Component({
    selector: 'app-merchant-location-detail',
    templateUrl: './merchant-location-detail.component.html',
    styleUrls: ['./merchant-location-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantLocationDetailComponent implements OnInit, OnDestroy {
    form: FormGroup;

    // options: MapOptions = {
    //     layers: [
    //         tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //             detectRetina: true,
    //             maxZoom: 18,
    //             maxNativeZoom: 18,
    //             minZoom: 3,
    //             attribution: 'Open Street Map'
    //         })
    //     ],
    //     zoom: 5,
    //     center: latLng([-2.5, 117.86])
    // };

    opts = {
        minZoom: 3,
        maxZoom: 18,
        zoom: 5,
        lat: -2.5,
        lng: 117.86,
        icon: {
            url: 'assets/images/marker.png',
            scaledSize: {
                width: 18,
                height: 30
            }
        }
    };
    draggAble = false;

    districtHighlight: string;
    urbanHighlight: string;

    isDistrictTyping = false;
    isUrbanTyping = false;

    store$: Observable<SupplierStore>;
    isEdit$: Observable<boolean>;
    isLoading$: Observable<boolean>;
    isLoadingDistrict$: Observable<boolean>;

    @ViewChild('autoDistrict', { static: false }) autoDistrict: MatAutocomplete;
    @ViewChild('triggerDistrict', { static: false, read: MatAutocompleteTrigger })
    triggerDistrict: MatAutocompleteTrigger;
    @ViewChild('triggerUrban', { static: false, read: MatAutocompleteTrigger })
    triggerUrban: MatAutocompleteTrigger;

    private _unSubs$: Subject<void> = new Subject<void>();
    private _timer: Array<NodeJS.Timer> = [];

    constructor(
        private cdRef: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private agmGeocoder: AgmGeocoder,
        private store: Store<fromMerchant.FeatureState>,
        private _$errorMessage: ErrorMessageService,
        private _$notice: NoticeService
    ) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        const { id } = this.route.parent.snapshot.params;

        this._initForm();

        this.store$ = this.store.select(StoreSelectors.getSelectedStore).pipe(
            tap(data => {
                if (data && data.store) {
                    this.form.get('address').setValue(data.store.address);
                    this.cdRef.detectChanges();
                }
            })
        );
        this.isEdit$ = this.store.select(StoreSelectors.getIsEditLocation).pipe(
            tap(isEditLocation => {
                this.draggAble = isEditLocation;

                if (this.draggAble) {
                    // Set footer action
                    this.store.dispatch(
                        UiActions.setFooterActionConfig({
                            payload: {
                                progress: {
                                    title: {
                                        label: 'Skor tambah toko',
                                        active: false
                                    },
                                    value: {
                                        active: false
                                    },
                                    active: false
                                },
                                action: {
                                    save: {
                                        label: 'Save',
                                        active: true
                                    },
                                    draft: {
                                        label: 'Save Draft',
                                        active: false
                                    },
                                    cancel: {
                                        label: 'Cancel',
                                        active: true
                                    }
                                }
                            }
                        })
                    );

                    this.store.dispatch(UiActions.showFooterAction());

                    this.store.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
                } else {
                    this.store.dispatch(UiActions.hideFooterAction());

                    this.store.dispatch(FormActions.resetClickCancelButton());
                    this.store.dispatch(FormActions.resetCancelButtonAction());
                }
            })
        );

        this.isLoading$ = this.store.select(StoreSelectors.getIsLoading);

        this.store.dispatch(StoreActions.fetchStoreRequest({ payload: id }));

        // Handle cancel button action (footer)
        this.store
            .select(FormSelectors.getIsClickCancelButton)
            .pipe(
                filter(isClick => !!isClick),
                takeUntil(this._unSubs$)
            )
            .subscribe(isClick => {
                console.log('CLICK CANCEL', isClick);
                this.store.dispatch(StoreActions.unsetEditLocation());

                this.store.dispatch(FormActions.resetClickCancelButton());
                this.store.dispatch(FormActions.resetCancelButtonAction());
            });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(StoreActions.resetStore());

        this.store.dispatch(UiActions.hideFooterAction());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    getErrorMessage(field: string): string {
        if (field) {
            const { errors } = this.form.get(field);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        }
    }

    hasError(field: string, isMatError = false): boolean {
        if (!field) {
            return;
        }

        const errors = this.form.get(field).errors;
        const touched = this.form.get(field).touched;
        const dirty = this.form.get(field).dirty;

        if (isMatError) {
            return errors && (dirty || touched);
        }

        return errors && ((touched && dirty) || touched);
    }

    hasLength(field: string, minLength: number): boolean {
        if (!field || !minLength) {
            return;
        }

        const value = this.form.get(field).value;

        return !value ? false : value.length <= minLength;
    }

    onChangeBound(ev: LatLngBounds): void {
        console.log('Change Bound', ev);
    }

    onChangeManually(ev: MatCheckboxChange): void {
        console.log('Manually', ev);

        if (ev.checked === true) {
            this.form.get('district').setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                })
            ]);

            this.form.get('urban').setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                })
            ]);
        } else {
            this.form.get('district').setValidators(null);
            this.form.get('urban').setValidators(null);
        }

        this.form.get('district').updateValueAndValidity();
        this.form.get('urban').updateValueAndValidity();
    }

    onDisplayDistrict(item: District): string {
        if (!item) {
            return;
        }

        return HelperService.truncateText(
            `${item.province.name}, ${item.city}, ${item.district}`,
            40,
            'start'
        );
    }

    onDragEnd(ev: MouseEvent): void {
        console.log('DraggEnd', ev.coords);

        if (ev.coords.lat && ev.coords.lng) {
            this._getAddress(ev.coords.lat, ev.coords.lng);
        }
    }

    onKeydown(ev: KeyboardEvent, field: string): void {
        if (!field) {
            return;
        }

        clearTimeout(this._timer[field]);
    }

    onKeyup(ev: KeyboardEvent, field: string): void {
        switch (field) {
            case 'district':
                {
                    if (!(ev.target as any).value || (ev.target as any).value.length < 3) {
                        this.store.dispatch(DropdownActions.resetDistrictsState());
                        return;
                    }

                    this.isDistrictTyping = true;

                    clearTimeout(this._timer[field]);

                    this._timer[field] = setTimeout(() => {
                        this.isDistrictTyping = false;
                    }, 100);
                }
                break;

            case 'urban':
                {
                    if (!(ev.target as any).value) {
                        // this.store.dispatch(DropdownActions.resetDistrictsState());
                        return;
                    }

                    this.isUrbanTyping = true;

                    clearTimeout(this._timer[field]);

                    this._timer[field] = setTimeout(() => {
                        this.isUrbanTyping = false;

                        // Detect change manually
                        this.cdRef.markForCheck();
                    }, 100);
                }
                break;

            default:
                return;
        }
    }

    onMapReady(map: any): void {
        console.log('MAP READY', map);
        // const newMarker = marker([46.879966, -121.726909], {
        //     icon: icon({
        //         iconSize: [25, 41],
        //         iconUrl: 'leaflet/marker-icon-2x.png',
        //         shadowUrl: 'leaflet/marker-shadow.png'
        //     })
        // });
        // this.options.layers.push(newMarker);

        // this.store
        //     .select(StoreSelectors.getSelectedStore)
        //     .pipe(
        //         filter(row => !!row),
        //         takeUntil(this._unSubs$)
        //     )
        //     .subscribe(state => {
        //         if (state && state.store && state.store.latitude && state.store.longitude) {
        //             // const newMarker = marker([state.store.latitude, state.store.longitude], {
        //             //     icon: icon({
        //             //         iconSize: [18, 30],
        //             //         iconUrl: 'assets/images/marker.png'
        //             //     })
        //             // });
        //             // newMarker.addTo(map);
        //             // const markerBound = latLngBounds([newMarker.getLatLng()]);
        //             // map.fitBounds(markerBound);
        //             const imageMarker = {
        //                 url: 'assets/images/marker.png',
        //                 // This marker is 18 pixels wide by 30 pixels high.
        //                 size: new google.maps.Size(50, 50),
        //                 // The origin for this image is (0, 0).
        //                 origin: new google.maps.Point(0, 0),
        //                 // The anchor for this image is the base of the flagpole at (0, 32).
        //                 anchor: new google.maps.Point(0, 32)
        //             };
        //             const newMarker = new google.maps.Marker({
        //                 draggable: true,
        //                 position: {
        //                     lat: state.store.latitude,
        //                     lng: state.store.longitude
        //                 },
        //                 icon: imageMarker,
        //                 map: map
        //             });
        //             newMarker.setMap(map);
        //             // const newMarker: AgmMarker = {
        //             //     iconUrl: 'assets/images/marker.png',
        //             //     latitude: state.store.latitude,
        //             //     longitude: state.store.longitude
        //             // };
        //             // this.markerManager.addMarker(newMarker);
        //         }
        //     });
    }

    /* onOpenAutocomplete(field: string): void {
        switch (field) {
            case 'district':
                {
                    if (this.autoDistrict && this.autoDistrict.panel && this.autoCompleteTrigger) {
                        fromEvent(this.autoDistrict.panel.nativeElement, 'scroll')
                            .pipe(
                                map(x => this.autoDistrict.panel.nativeElement.scrollTop),
                                withLatestFrom(
                                    this.store.select(DropdownSelectors.getTotalDistrictEntity),
                                    this.store.select(DropdownSelectors.getTotalDistrict)
                                ),
                                takeUntil(this.autoCompleteTrigger.panelClosingActions)
                            )
                            .subscribe(([x, skip, total]) => {
                                const scrollTop = this.autoDistrict.panel.nativeElement.scrollTop;
                                const scrollHeight = this.autoDistrict.panel.nativeElement
                                    .scrollHeight;
                                const elementHeight = this.autoDistrict.panel.nativeElement
                                    .clientHeight;
                                const atBottom = scrollHeight === scrollTop + elementHeight;

                                if (atBottom && skip && total && skip < total) {
                                    const data: IQueryParams = {
                                        limit: 10,
                                        skip: skip
                                    };

                                    data['paginate'] = true;

                                    if (this.districtHighlight) {
                                        data['search'] = [
                                            {
                                                fieldName: 'keyword',
                                                keyword: this.districtHighlight
                                            }
                                        ];

                                        this.store.dispatch(
                                            DropdownActions.fetchScrollDistrictRequest({
                                                payload: data
                                            })
                                        );
                                    }
                                }
                            });
                    }
                }
                break;

            default:
                return;
        }
    } */

    private _initForm(): void {
        this.form = this.formBuilder.group({
            address: '',
            manually: false,
            district: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            urban: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            notes: ''
        });
    }

    private _getAddress(lat: number, lng: number): void {
        // this.fitBoundService.getBounds$.subscribe(x => {
        //     console.log('Fit Bound', x);
        // });
        this.agmGeocoder.geocode({ location: { lat: lat, lng: lng } }).subscribe({
            next: res => {
                console.log('GEOCODE', res);

                if (res && res[0]) {
                    this.form.get('address').setValue(res[0].formatted_address);
                    this.cdRef.detectChanges();
                } else {
                    this._$notice.open('No results found', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                }
            },
            error: err => {
                this._$notice.open('Failed geocoder', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            }
        });
    }
}
