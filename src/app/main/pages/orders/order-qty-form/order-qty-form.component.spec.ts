import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderQtyFormComponent } from './order-qty-form.component';

describe('OrderQtyFormComponent', () => {
  let component: OrderQtyFormComponent;
  let fixture: ComponentFixture<OrderQtyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderQtyFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderQtyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
