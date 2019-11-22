import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierInventoriesComponent } from './supplier-inventories.component';

describe('SupplierInventoriesComponent', () => {
  let component: SupplierInventoriesComponent;
  let fixture: ComponentFixture<SupplierInventoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierInventoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierInventoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
