import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HelperService } from './helper.service';
import { Observable } from 'rxjs';

// Jenis upload photo yang di-support.
export type TUploadPhotoType = 'userTax' | 'storeTax' | 'storePhoto' | 'selfie' | 'idCard';

export interface UploadPhotoApiPayload {
    image: string;
    type: TUploadPhotoType;
    oldLink: string;
}

// Bentuk response setelah upload photo.
interface UploadPhotoApiResponse {
    url: string;
}

@Injectable({
    providedIn: 'root',
})
export class PhotoUploadApiService {
    // Untuk menyimpan URL yang sedang aktif.
    private _url: string;
    // URL yang digunakan untuk upload photo.
    private readonly _endpoint = '/upload-user-photo';
    // Jenis upload photo yang di-support.
    private readonly _types: Array<TUploadPhotoType> = [
        'userTax', 'storeTax', 'storePhoto', 'selfie', 'idCard'
    ];

    constructor(
        private http: HttpClient,
        private _$helper: HelperService
    ) {
        // Menetapkan URL untuk ke endpoint upload photo.
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    upload(image: string, type: TUploadPhotoType, oldLink: string = null): Observable<UploadPhotoApiResponse> {
        // Error-kan jika type-nya tidak diketahui.
        if (!this._types.includes(type)) {
            throw new Error('ERR_INVALID_UPLOAD_PHOTO_TYPE');
        }

        // Menyiapkan payload-nya.
        const body: UploadPhotoApiPayload = { image, type, oldLink };
        // Menyiapkan URL-nya.
        this._url = this._$helper.handleApiRouter(this._endpoint);
        // Memulai proses upload-nya.
        return this.http.post<UploadPhotoApiResponse>(this._url, body);
    }
}
