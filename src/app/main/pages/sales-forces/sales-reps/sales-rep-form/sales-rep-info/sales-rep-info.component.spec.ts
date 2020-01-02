import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesRepInfoComponent } from './sales-rep-info.component';

describe('SalesRepInfoComponent', () => {
  let component: SalesRepInfoComponent;
  let fixture: ComponentFixture<SalesRepInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesRepInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesRepInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
