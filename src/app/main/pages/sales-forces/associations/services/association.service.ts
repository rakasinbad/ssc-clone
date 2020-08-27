import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Warehouse } from 'app/shared/components/dropdowns/single-warehouse/models';
import { SalesRep } from 'app/shared/components/dropdowns/single-sales-rep/models';

export type AssociationTab = 
    | 'all'
    | 'store-assigned-to-sr-in-portfolio'
    | 'store-assigned-to-sr-out-of-portfolio'
    | 'store-not-assigned-to-sr-in-portfolio'
    | 'store-not-assigned-to-sr-out-of-portfolio'
    | 'sales-rep-with-assignment'
    | 'sales-rep-without-assignment'
    | 'portfolio-assigned-to-sr'
    | 'portfolio-not-assigned-to-sr';

export type AssociationViewBy =
    | 'store'
    | 'portfolio'
    | 'sales-rep';

export type AssociationPortfolioType = 'in' | 'out';

@Injectable({
    providedIn: 'root'
})
export class AssociationService implements OnDestroy {

    private portfolioType$: BehaviorSubject<AssociationPortfolioType> = new BehaviorSubject<AssociationPortfolioType>(null);
    private search$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    private selectedTab$: BehaviorSubject<AssociationTab> = new BehaviorSubject<AssociationTab>(null);
    private selectedViewBy$: BehaviorSubject<AssociationViewBy> = new BehaviorSubject<AssociationViewBy>('store');
    private selectedWarehouse$: BehaviorSubject<Warehouse> = new BehaviorSubject<Warehouse>(null);
    private selectedSalesRep$: BehaviorSubject<SalesRep> = new BehaviorSubject<SalesRep>(null);
    private loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor() {}

    getLoadingState(): Observable<boolean> {
        return this.loading$.asObservable();
    }
    
    getSelectedPortfolioType(): Observable<AssociationPortfolioType> {
        return this.portfolioType$.asObservable();
    }
    
    getSearchValue(): Observable<string> {
        return this.search$.asObservable();
    }

    getSelectedTab(): Observable<AssociationTab> {
        return this.selectedTab$.asObservable();
    }

    getSelectedViewBy(): Observable<AssociationViewBy> {
        return this.selectedViewBy$.asObservable();
    }

    getSelectedSalesRep(): Observable<SalesRep> {
        return this.selectedSalesRep$.asObservable();
    }
    
    getSelectedWarehouse(): Observable<Warehouse> {
        return this.selectedWarehouse$.asObservable();
    }

    setLoadingState(value: boolean): void {
        this.loading$.next(value);
    }
    
    setSelectedPortfolioType(value: AssociationPortfolioType): void {
        this.portfolioType$.next(value);
    }
    
    setSearchValue(value: string): void {
        this.search$.next(value);
    }
    
    selectTab(tab: AssociationTab): void {
        this.selectedTab$.next(tab);
    }

    selectViewBy(viewBy: AssociationViewBy): void {
        this.selectedViewBy$.next(viewBy);
    }

    selectSalesRep(salesRep: SalesRep): void {
        this.selectedSalesRep$.next(salesRep);
    }
    
    selectWarehouse(warehouse: Warehouse): void {
        this.selectedWarehouse$.next(warehouse);
    }

    ngOnDestroy(): void {
        this.search$.next(null);
        this.search$.complete();
        
        this.selectedTab$.next(null);
        this.selectedTab$.complete();

        this.selectedViewBy$.next(null);
        this.selectedViewBy$.complete();

        this.selectedWarehouse$.next(null);
        this.selectedWarehouse$.complete();
    }
}
