import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HelperService } from './helper.service';
import { Observable } from 'rxjs';

// Jenis upload document yang di-support.
export type TUploadDocumentType = 'supplierOfficialDocument' ;

export interface UploadDocumentApiPayload {
    document: string;
    type: TUploadDocumentType;
    oldLink: string;
}

// Bentuk response setelah upload document.
interface UploadDocumentApiResponse {
    url: string;
}

@Injectable({
    providedIn: 'root',
})
export class DocumentUploadApiService {
    // Untuk menyimpan URL yang sedang aktif.
    private _url: string;
    // URL yang digunakan untuk upload document.
    private readonly _endpoint = '/upload-user-document';
    // Jenis upload document yang di-support.
    private readonly _types: Array<TUploadDocumentType> = [
        'supplierOfficialDocument'
    ];

    constructor(
        private http: HttpClient,
        private _$helper: HelperService
    ) {
        // Menetapkan URL untuk ke endpoint upload document.
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    upload(document: string, type: TUploadDocumentType, oldLink: string = null): Observable<UploadDocumentApiResponse> {
        // Error-kan jika type-nya tidak diketahui.
        if (!this._types.includes(type)) {
            throw new Error('ERR_INVALID_UPLOAD_DOCUMENT_TYPE');
        }

        // Menyiapkan payload-nya.
        const body: UploadDocumentApiPayload = { document, type, oldLink };
        // Menyiapkan URL-nya.
        this._url = this._$helper.handleApiRouter(this._endpoint);
        // Memulai proses upload-nya.
        return this.http.post<UploadDocumentApiResponse>(this._url, body);
    }
}
