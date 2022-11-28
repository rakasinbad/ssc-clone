import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CataloguesImportComponent } from './catalogues-import.component';

describe('CataloguesImportComponent', () => {
  let component: CataloguesImportComponent;
  let fixture: ComponentFixture<CataloguesImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CataloguesImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CataloguesImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
