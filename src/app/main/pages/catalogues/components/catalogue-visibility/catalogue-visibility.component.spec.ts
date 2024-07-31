import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogueVisibilityComponent } from './catalogue-visibility.component';

describe('CatalogueVisibilityComponent', () => {
  let component: CatalogueVisibilityComponent;
  let fixture: ComponentFixture<CatalogueVisibilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogueVisibilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogueVisibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
