import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPreviewConfirmComponent } from './order-preview-confirm.component';

describe('OrderPreviewConfirmComponent', () => {
  let component: OrderPreviewConfirmComponent;
  let fixture: ComponentFixture<OrderPreviewConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderPreviewConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderPreviewConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
