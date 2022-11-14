import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OmsOrderLineComponent } from './oms-order-line.component';

describe('OmsOrderLineComponent', () => {
  let component: OmsOrderLineComponent;
  let fixture: ComponentFixture<OmsOrderLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OmsOrderLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OmsOrderLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
