import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBillingComponent } from './list-billing.component';

describe('ListBillingComponent', () => {
  let component: ListBillingComponent;
  let fixture: ComponentFixture<ListBillingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListBillingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
