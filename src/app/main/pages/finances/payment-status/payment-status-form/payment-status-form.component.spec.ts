import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentStatusFormComponent } from './payment-status-form.component';

describe('PaymentStatusFormComponent', () => {
  let component: PaymentStatusFormComponent;
  let fixture: ComponentFixture<PaymentStatusFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentStatusFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentStatusFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
