import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesRepDetailComponent } from './sales-rep-detail.component';

describe('SalesRepDetailComponent', () => {
  let component: SalesRepDetailComponent;
  let fixture: ComponentFixture<SalesRepDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesRepDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesRepDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
