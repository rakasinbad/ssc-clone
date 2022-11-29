import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CataloguesEditPriceStockComponent } from './catalogues-edit-price-stock.component';

describe('CataloguesEditPriceStockComponent', () => {
  let component: CataloguesEditPriceStockComponent;
  let fixture: ComponentFixture<CataloguesEditPriceStockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CataloguesEditPriceStockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CataloguesEditPriceStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
