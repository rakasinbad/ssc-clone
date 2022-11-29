import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryStatusInfoComponent } from './delivery-status-info.component';

describe('DeliveryStatusInfoComponent', () => {
  let component: DeliveryStatusInfoComponent;
  let fixture: ComponentFixture<DeliveryStatusInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryStatusInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryStatusInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
