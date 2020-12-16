import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogueSegmentationFormComponent } from './catalogue-segmentation-form.component';

describe('CatalogueSegmentationFormComponent', () => {
  let component: CatalogueSegmentationFormComponent;
  let fixture: ComponentFixture<CatalogueSegmentationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogueSegmentationFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogueSegmentationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
