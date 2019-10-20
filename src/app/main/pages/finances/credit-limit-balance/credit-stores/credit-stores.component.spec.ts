import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditStoresComponent } from './credit-stores.component';

describe('CreditStoresComponent', () => {
  let component: CreditStoresComponent;
  let fixture: ComponentFixture<CreditStoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditStoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditStoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
