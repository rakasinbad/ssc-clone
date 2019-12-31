import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesRepPasswordComponent } from './sales-rep-password.component';

describe('SalesRepPasswordComponent', () => {
  let component: SalesRepPasswordComponent;
  let fixture: ComponentFixture<SalesRepPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesRepPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesRepPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
