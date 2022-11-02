import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MultipleSelectionService implements OnDestroy {

    private message: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor() {}

    getMessage(): Observable<string> {
        return this.message.asObservable();
    }

    clearAllSelectedOptions(): void {
        this.message.next('clear-all');
    }

    selectAllOptions(): void {
        this.message.next('select-all')
    }

    selectAllFalse(): void {
        this.message.next('select-all-false')
    }

    ngOnDestroy(): void {
        this.message.next('');
        this.message.complete();
    }
}
