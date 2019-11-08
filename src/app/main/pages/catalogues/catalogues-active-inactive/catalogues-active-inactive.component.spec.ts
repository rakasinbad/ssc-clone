import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CataloguesActiveInactiveComponent } from './catalogues-active-inactive.component';

describe('CataloguesActiveInactiveComponent', () => {
  let component: CataloguesActiveInactiveComponent;
  let fixture: ComponentFixture<CataloguesActiveInactiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CataloguesActiveInactiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CataloguesActiveInactiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
