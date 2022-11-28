import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CataloguesSelectCategoryComponent } from './catalogues-select-category.component';

describe('CataloguesSelectCategoryComponent', () => {
  let component: CataloguesSelectCategoryComponent;
  let fixture: ComponentFixture<CataloguesSelectCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CataloguesSelectCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CataloguesSelectCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
