import { Injectable } from '@angular/core';
import { BranchWarehouse } from 'app/shared/models/branch.model';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class WHDialogService {

  private selectedRegions = new BehaviorSubject<number[]>([]);
  currentSelectedRegions= this.selectedRegions.asObservable();

  private selectedBranches = new BehaviorSubject<number[]>([]);
  currentSelectedBranches= this.selectedBranches.asObservable();

  private selectedWarehouses = new BehaviorSubject<BranchWarehouse[]>([]);
  currentSelectedWarehouses = this.selectedWarehouses.asObservable();

  constructor() { }

  changeRegions(regions: number[]) {
    this.selectedRegions.next(regions)
  }

  changeBranches(branches: number[]) {
    this.selectedBranches.next(branches)
  }

  changeWarehouses(warehouses: BranchWarehouse[]) {
    this.selectedWarehouses.next(warehouses)
  }

  resetRegions() {
    this.selectedRegions.next([]);
  }

  resetBranches() {
    this.selectedBranches.next([]);
  }

  resetWarehouses() {
    this.selectedWarehouses.next([]);
  }

  reset() {
    this.selectedRegions.next([]);
    this.selectedBranches.next([]);
    this.selectedWarehouses.next([]);
  }

}