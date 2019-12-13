import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { IQueryParams } from '../models/query.model';

@Injectable({
    providedIn: 'root'
})
export class HelperService {
    private static _host = environment.host;
    // tslint:disable-next-line: max-line-length
    private static readonly _regexIp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    private _currentHost: string;

    constructor(@Inject(DOCUMENT) private doc: Document, private http: HttpClient) {
        this._currentHost = this.doc.location.hostname;
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
                label: 'Semua'
            },
            {
                id: 'checkout',
                label: 'Quotation'
            },
            {
                id: 'confirm',
                label: 'Order Baru'
            },
            {
                id: 'packing',
                label: 'Dikemas'
            },
            {
                id: 'shipping',
                label: 'Dikirim'
            },
            {
                id: 'delivered',
                label: 'Diterima'
            },
            {
                id: 'done',
                label: 'Selesai'
            },
            {
                id: 'cancel',
                label: 'Batal'
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
}
