import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogueSegmentationDetailComponent } from './catalogue-segmentation-detail.component';

describe('CatalogueSegmentationDetailComponent', () => {
  let component: CatalogueSegmentationDetailComponent;
  let fixture: ComponentFixture<CatalogueSegmentationDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogueSegmentationDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogueSegmentationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
