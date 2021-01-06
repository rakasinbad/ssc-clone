import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseAutocompleteMultiComponent } from './warehouse-autocomplete-multi.component';

describe('WarehouseAutocompleteMultiComponent', () => {
  let component: WarehouseAutocompleteMultiComponent;
  let fixture: ComponentFixture<WarehouseAutocompleteMultiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseAutocompleteMultiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseAutocompleteMultiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
