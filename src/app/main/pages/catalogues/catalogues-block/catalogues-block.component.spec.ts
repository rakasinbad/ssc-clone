import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CataloguesBlockComponent } from './catalogues-block.component';

describe('CataloguesBlockComponent', () => {
  let component: CataloguesBlockComponent;
  let fixture: ComponentFixture<CataloguesBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CataloguesBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CataloguesBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
