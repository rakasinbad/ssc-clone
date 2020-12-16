import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogueSegmentationComponent } from './catalogue-segmentation.component';

describe('CatalogueSegmentationComponent', () => {
  let component: CatalogueSegmentationComponent;
  let fixture: ComponentFixture<CatalogueSegmentationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogueSegmentationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogueSegmentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
