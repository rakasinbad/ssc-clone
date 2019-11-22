import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierInventoryFormComponent } from './supplier-inventory-form.component';

describe('SupplierInventoryFormComponent', () => {
  let component: SupplierInventoryFormComponent;
  let fixture: ComponentFixture<SupplierInventoryFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierInventoryFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierInventoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
