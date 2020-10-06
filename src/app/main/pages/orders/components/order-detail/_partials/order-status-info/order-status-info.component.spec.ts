import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderStatusInfoComponent } from './order-status-info.component';

describe('OrderStatusInfoComponent', () => {
  let component: OrderStatusInfoComponent;
  let fixture: ComponentFixture<OrderStatusInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderStatusInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderStatusInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
