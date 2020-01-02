import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesRepDetailInfoComponent } from './sales-rep-detail-info.component';

describe('SalesRepDetailInfoComponent', () => {
  let component: SalesRepDetailInfoComponent;
  let fixture: ComponentFixture<SalesRepDetailInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesRepDetailInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesRepDetailInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
