import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CataloguesFormComponent } from './catalogues-form.component';

describe('CataloguesFormComponent', () => {
  let component: CataloguesFormComponent;
  let fixture: ComponentFixture<CataloguesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CataloguesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CataloguesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
