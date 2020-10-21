import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FileService {
    constructor() {}

    readFile(file: File | Blob): Observable<any> {
        const reader = new FileReader();
        const loadend = fromEvent(reader, 'loadend').pipe(map((read: any) => read.target.result));
        reader.readAsDataURL(file);
        return loadend;
    }
}
