import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogueSegmentationListComponent } from './catalogue-segmentation-list.component';

describe('CatalogueSegmentationListComponent', () => {
  let component: CatalogueSegmentationListComponent;
  let fixture: ComponentFixture<CatalogueSegmentationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogueSegmentationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogueSegmentationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
