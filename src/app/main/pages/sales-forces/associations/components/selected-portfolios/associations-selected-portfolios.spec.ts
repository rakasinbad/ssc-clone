import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociationsSelectedPortfoliosComponent } from './associations-selected-portfolios.component';

describe('PortfoliosSelectedStoresComponent', () => {
  let component: AssociationsSelectedPortfoliosComponent;
  let fixture: ComponentFixture<AssociationsSelectedPortfoliosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociationsSelectedPortfoliosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociationsSelectedPortfoliosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
