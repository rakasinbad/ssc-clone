import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogueSegmentationDetailPageComponent } from './catalogue-segmentation-detail-page.component';

describe('CatalogueSegmentationDetailPageComponent', () => {
  let component: CatalogueSegmentationDetailPageComponent;
  let fixture: ComponentFixture<CatalogueSegmentationDetailPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogueSegmentationDetailPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogueSegmentationDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
