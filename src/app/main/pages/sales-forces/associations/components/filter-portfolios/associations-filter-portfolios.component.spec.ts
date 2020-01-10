import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociationsFilterPortfoliosComponent } from './associations-filter-portfolios.component';

describe('PortfoliosFilterStoresComponent', () => {
  let component: AssociationsFilterPortfoliosComponent;
  let fixture: ComponentFixture<AssociationsFilterPortfoliosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociationsFilterPortfoliosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociationsFilterPortfoliosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
