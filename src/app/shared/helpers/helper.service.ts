import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ElementRef, Inject, Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Auth } from 'app/main/pages/core/auth/models';
import { environment } from 'environments/environment';
import * as jwt_decode from 'jwt-decode';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ErrorHandler, TNullable, User } from '../models';
import { IQueryParams } from '../models/query.model';
import { NoticeService } from './notice.service';

type TTemplateFiles = {
    catalogueStock: string;
    orderStatus: string;
    paymentStatus: string;
};

@Injectable({
    providedIn: 'root'
})
export class HelperService {
    private static _host = environment.host;
    // tslint:disable-next-line: max-line-length
    private static readonly _regexIp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    private _currentHost: string;
    private _attendanceTypes: Array<{ value: string; text: string }> = [
        {
            value: 'absent',
            text: 'Tidak Hadir'
        },
        {
            value: 'present',
            text: 'Hadir'
        },
        {
            value: 'leave',
            text: 'Cuti'
        }
    ];
    private _locationTypes: Array<{ value: string; text: string }> = [
        {
            value: 'inside',
            text: 'Kerja di Toko'
        },
        {
            value: 'outside',
            text: 'Kerja di Luar Toko'
        },
        {
            value: 'others',
            text: 'Lainnya'
        }
    ];

    constructor(
        @Inject(DOCUMENT) private doc: Document,
        private http: HttpClient,
        private storage: StorageMap,
        private _$notice: NoticeService
    ) {
        this._currentHost = this.doc.location.hostname;
    }

    static truncateText(value: string, maxLength: number, type: 'start' | 'end'): string {
        console.log(value.length, maxLength);

        if (value.length > maxLength) {
            switch (type) {
                case 'start': {
                    const ellipsis = '...';
                    const valueArr = value.split(',');

                    if (valueArr.length > 0) {
                        return `${ellipsis}, ${valueArr[1]}, ${valueArr[2]}`;
                    }

                    return `${ellipsis}${value.slice(-(maxLength - ellipsis.length))}`;
                }

                case 'end':
                default: {
                    const ellipsis = '...';
                    return `${value.slice(0, maxLength - ellipsis.length)}${ellipsis}`;
                }
            }
        }

        return value;
    }

    handleApiRouter(endpoint: string): string {
        /* if (
            HelperService._regexIp.test(this._currentHost) ||
            this._currentHost === 'localhost'
        ) {
            return `${}`
        } */

        return `${HelperService._host}${endpoint}`;
    }

    handleParams(url: string, params: IQueryParams, ...args): HttpParams {
        let newParams = new HttpParams();

        if (params) {
            if (params.paginate) {
                if (!newParams.has('$limit')) {
                    newParams = !params.limit
                        ? newParams.set('$limit', '5')
                        : newParams.set('$limit', params.limit.toString());
                }

                // newParams = !params.limit
                //     ? newParams.set('$limit', '5')
                //     : newParams.set('$limit', params.limit.toString());

                if (!newParams.has('$skip')) {
                    newParams = !params.skip
                        ? newParams.set('$skip', '0')
                        : newParams.set('$skip', params.skip.toString());
                }

                // newParams = !params.skip
                //     ? newParams.set('$skip', '0')
                //     : newParams.set('$skip', params.skip.toString());
            } else {
                newParams = !params.paginate
                    ? newParams.set('paginate', 'false')
                    : newParams.set('paginate', 'true');
            }

            if (!newParams.has('sort') && !newParams.has('sortby')) {
                if (params.sort && params.sortBy) {
                    newParams = newParams.set('sort', params.sort).set('sortby', params.sortBy);
                }
            }

            if (params.sort && params.sortBy) {
                newParams = newParams.set('sort', params.sort).set('sortby', params.sortBy);
            }

            if (params.search) {
                if (params.search.length) {
                    for (const search of params.search) {
                        if (
                            (search.fieldName && search.fieldName === 'keyword') ||
                            search.fieldName === 'type' ||
                            search.fieldName === 'statusPayment' ||
                            search.fieldName === 'dueDay' ||
                            search.fieldName === 'status'
                        ) {
                            if (search.fieldName === 'statusPayment') {
                                if (newParams.has('dueDay')) {
                                    newParams.delete('dueDay');
                                }
                            }

                            if (search.fieldName === 'dueDay') {
                                if (newParams.has('statusPayment')) {
                                    newParams.delete('statusPayment');
                                }
                            }

                            newParams = newParams.set(`${search.fieldName}`, `${search.keyword}`);
                        } else if (search.fieldName && search.fieldName !== 'id') {
                            newParams = newParams.append(
                                `search[${search.fieldName}]`,
                                `${search.keyword}`
                            );
                        }
                    }
                }
            }
        }

        // console.log('ARGS 1', args);

        if (args && args.length > 0) {
            args.forEach(arg => {
                if (arg.key && arg.value) {
                    newParams = newParams.append(arg.key, arg.value);
                }
            });
        }

        // console.log(params);
        // console.log(newParams.toString());

        return newParams;

        /* const newUrl = [`${url}?$limit=${params.limit}&$skip=${params.skip}`];

        if (params.sort && params.sortBy) {
            newUrl[1] = `&sort=${params.sort}&sortBy=${params.sortBy}`;
        }

        if (params.search) {
            if (params.search.length) {
                const searchArr = [];

                for (const search of params.search) {
                    if (search.fieldName && search.fieldName !== 'id') {
                        searchArr.push(`search[${search.fieldName}]=${search.keyword}`);
                    }
                }

                if (searchArr.length > 0) {
                    newUrl[2] = `&${searchArr.join('&')}`;
                }
            }
        }

        return newUrl.join(''); */
    }

    isReachable(): Observable<boolean> {
        return this.http
            .head<boolean>('https://id.yahoo.com', {
                // headers: new HttpHeaders({
                //     Accept: '*/*'
                // }),
                observe: 'response'
            })
            .pipe(
                map(res => res && res.ok && res.status === 200),
                catchError(err => of(false))
            );
    }

    getQuantityChoices(): Array<{ id: string; label: string }> {
        return [
            { id: 'pcs', label: 'per Piece' },
            { id: 'master_box', label: 'Master Box' },
            { id: 'custom', label: 'Custom' }
        ];
    }

    // buildingType(): { id: string; label: string }[] {}

    numberOfEmployee(): { id: string; label: string }[] {
        return [
            {
                id: '1',
                label: '1 Orang'
            },
            {
                id: '2-10',
                label: '2-10 Orang'
            },
            {
                id: '11-20',
                label: '11-20 Orang'
            },
            {
                id: '>50',
                label: '> 50 Orang'
            }
        ];
    }

    orderStatus(): { id: string; label: string }[] {
        return [
            {
                id: 'all',
                label: 'All'
            },
            {
                id: 'checkout',
                label: 'Quotation'
            },
            {
                id: 'confirm',
                label: 'New Order'
            },
            {
                id: 'packing',
                label: 'Packed'
            },
            {
                id: 'shipping',
                label: 'Shipped'
            },
            {
                id: 'delivered',
                label: 'Delivered'
            },
            {
                id: 'done',
                label: 'Done'
            },
            {
                id: 'cancel',
                label: 'Canceled'
            }
        ];
    }

    paymentStatus(): { id: string; label: string }[] {
        return [
            {
                id: 'waiting_for_payment',
                label: 'Waiting for Payment'
            },
            {
                id: 'payment_failed',
                label: 'Payment Failed'
            },
            {
                id: 'paid',
                label: 'Paid'
            },
            {
                id: 'overdue',
                label: 'Overdue'
            }
        ];
    }

    storeStatus(): { id: string; label: string }[] {
        return [
            {
                id: 'all',
                label: 'Semua'
            },
            {
                id: 'active',
                label: 'Active'
            },
            {
                id: 'inactive',
                label: 'Inactive'
            },
            {
                id: 'banned',
                label: 'Banned'
            }
        ];
    }

    stockType(): { id: boolean; label: string }[] {
        return [
            {
                id: true,
                label: 'Unlimited'
            },
            {
                id: false,
                label: 'Limited'
            }
        ];
    }

    unitParameter(): { id: string; label: string }[] {
        return [
            {
                id: 'province',
                label: 'Provinsi'
            },
            {
                id: 'city',
                label: 'Kota/Kabupaten'
            },
            {
                id: 'district',
                label: 'Kecamatan'
            },
            {
                id: 'urban',
                label: 'Kelurahan'
            }
        ];
    }

    unitParameterType(): { id: string; label: string }[] {
        return [
            {
                id: 'all',
                label: 'Select All'
            },
            {
                id: 'manually',
                label: 'Select Manually'
            }
        ];
    }

    attendanceType(value: string): string {
        const attendanceType = this._attendanceTypes.filter(attType => attType.value === value);

        if (attendanceType.length === 0) {
            return '-';
        }

        return attendanceType[0].text;
    }

    attendanceTypes(): Array<{ value: string; text: string }> {
        return this._attendanceTypes;
    }

    locationType(value: string): string {
        const locationType = this._locationTypes.filter(locType => locType.value === value);

        if (locationType.length === 0) {
            return '-';
        }

        return locationType[0].text;
    }

    locationTypes(): Array<{ value: string; text: string }> {
        return this._locationTypes;
    }

    downloadTemplate(): Observable<TTemplateFiles> {
        const url = this.handleApiRouter('/import-template-links');
        return this.http.get<TTemplateFiles>(url);
    }

    decodeUserToken(): Observable<TNullable<User>> {
        return this.storage.get<Auth>('user').pipe(
            map((userAuth: Auth) => {
                if (!userAuth) {
                    throwError(
                        new ErrorHandler({
                            id: 'ERR_NO_TOKEN',
                            errors: `Token found: ${userAuth.token}`
                        })
                    );
                } else {
                    try {
                        let userData: User;

                        if (!userAuth.user) {
                            // Decode the token.
                            const decodedToken = jwt_decode<Auth>(userAuth.token);
                            userData = decodedToken.user;
                        } else {
                            userData = userAuth.user;
                        }

                        // Create User object.
                        const user = new User(userData);
                        // user.setUserStores = userData.userStores;
                        // user.setUserSuppliers = userData.userSuppliers;
                        // user.setUrban = userData.urban;
                        // user.setAttendances = userData.attendances;

                        // Return the value as User object.
                        return user;
                    } catch (e) {
                        throwError(
                            new ErrorHandler({
                                id: 'ERR_USER_INVALID_TOKEN',
                                errors: `Local Storage's auth found: ${userAuth} | Error: ${e}`
                            })
                        );
                    }
                }
            })
        );
    }

    infoNotice(text: string = 'This feature is coming soon!'): void {
        this._$notice.open(text, 'info', {
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            duration: 7000
        });
    }

    isElementScrolledToBottom(element: ElementRef<HTMLElement>): boolean {
        // Mengambil element native dari CdkScrollable yang sedang di-scroll.
        const { nativeElement } = element;

        // Tidak dilanjutkan jika tidak meneumukan nativeElement.
        if (!nativeElement) {
            console.error('nativeElement not found.');
            return false;
        }

        // Mengambil beberapa property dari element native.
        const { clientHeight, scrollTop, scrollHeight } = nativeElement;

        // Pemeriksaan jika scroll sudah mencapai dasar.
        const isReachedBottom = scrollHeight - scrollTop < clientHeight + 48;
        if (!isReachedBottom) {
            // Tidak akan diteruskan jika elemen tersebut tidak di-scroll hingga dasarnya.
            return false;
        }

        return true;
    }
}
