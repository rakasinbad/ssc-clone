import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentGroupAutocompleteComponent } from './segment-group-autocomplete.component';

describe('SegmentGroupAutocompleteComponent', () => {
  let component: SegmentGroupAutocompleteComponent;
  let fixture: ComponentFixture<SegmentGroupAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SegmentGroupAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SegmentGroupAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
