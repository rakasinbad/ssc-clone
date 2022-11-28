import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CataloguesRemoveComponent } from './catalogues-remove.component';

describe('CataloguesRemoveComponent', () => {
  let component: CataloguesRemoveComponent;
  let fixture: ComponentFixture<CataloguesRemoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CataloguesRemoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CataloguesRemoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
