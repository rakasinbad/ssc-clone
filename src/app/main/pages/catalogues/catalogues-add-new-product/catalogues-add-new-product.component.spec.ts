import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CataloguesAddNewProductComponent } from './catalogues-add-new-product.component';

describe('CataloguesAddNewProductComponent', () => {
  let component: CataloguesAddNewProductComponent;
  let fixture: ComponentFixture<CataloguesAddNewProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CataloguesAddNewProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CataloguesAddNewProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
