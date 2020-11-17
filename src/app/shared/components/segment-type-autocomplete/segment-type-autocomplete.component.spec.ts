import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentTypeAutocompleteComponent } from './segment-type-autocomplete.component';

describe('SegmentTypeAutocompleteComponent', () => {
  let component: SegmentTypeAutocompleteComponent;
  let fixture: ComponentFixture<SegmentTypeAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SegmentTypeAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SegmentTypeAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
