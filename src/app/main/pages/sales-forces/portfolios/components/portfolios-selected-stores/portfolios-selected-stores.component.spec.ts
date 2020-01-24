import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfoliosSelectedStoresComponent } from './portfolios-selected-stores.component';

describe('PortfoliosSelectedStoresComponent', () => {
  let component: PortfoliosSelectedStoresComponent;
  let fixture: ComponentFixture<PortfoliosSelectedStoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfoliosSelectedStoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfoliosSelectedStoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
