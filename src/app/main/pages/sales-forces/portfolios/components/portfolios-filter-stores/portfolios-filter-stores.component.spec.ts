import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfoliosFilterStoresComponent } from './portfolios-filter-stores.component';

describe('PortfoliosFilterStoresComponent', () => {
  let component: PortfoliosFilterStoresComponent;
  let fixture: ComponentFixture<PortfoliosFilterStoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfoliosFilterStoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfoliosFilterStoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
