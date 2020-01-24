import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesRepDetailPasswordComponent } from './sales-rep-detail-password.component';

describe('SalesRepDetailPasswordComponent', () => {
  let component: SalesRepDetailPasswordComponent;
  let fixture: ComponentFixture<SalesRepDetailPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesRepDetailPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesRepDetailPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
