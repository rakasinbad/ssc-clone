import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseSelectSearchMultiComponent } from './warehouse-select-search-multi.component';

describe('WarehouseSelectSearchMultiComponent', () => {
  let component: WarehouseSelectSearchMultiComponent;
  let fixture: ComponentFixture<WarehouseSelectSearchMultiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseSelectSearchMultiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseSelectSearchMultiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
