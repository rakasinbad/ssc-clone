import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofOfPaymentFormComponent } from './proof-of-payment-form.component';

describe('ProofOfPaymentFormComponent', () => {
  let component: ProofOfPaymentFormComponent;
  let fixture: ComponentFixture<ProofOfPaymentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProofOfPaymentFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProofOfPaymentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
