import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderStoreShipmentComponent } from './order-store-shipment.component';

describe('OrderStoreShipmentComponent', () => {
  let component: OrderStoreShipmentComponent;
  let fixture: ComponentFixture<OrderStoreShipmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderStoreShipmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderStoreShipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
