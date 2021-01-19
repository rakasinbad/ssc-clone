import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SkpLinkedList } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SingleSelectLinkedSkpService implements OnDestroy {

    private message: BehaviorSubject<SkpLinkedList> = new BehaviorSubject<SkpLinkedList>(null);

    constructor() {}

    getSelectedSkpLinkedList(): Observable<SkpLinkedList> {
        return this.message.asObservable();
    }

    selectSkpLinkedList(catalogueSegment: SkpLinkedList): void {
        this.message.next(catalogueSegment);
    }

    ngOnDestroy(): void {
        this.message.next(null);
        this.message.complete();
    }
}