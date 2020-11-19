import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentClusterAutocompleteComponent } from './segment-cluster-autocomplete.component';

describe('SegmentClusterAutocompleteComponent', () => {
  let component: SegmentClusterAutocompleteComponent;
  let fixture: ComponentFixture<SegmentClusterAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SegmentClusterAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SegmentClusterAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
