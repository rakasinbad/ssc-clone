import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentChannelAutocompleteComponent } from './segment-channel-autocomplete.component';

describe('SegmentChannelAutocompleteComponent', () => {
  let component: SegmentChannelAutocompleteComponent;
  let fixture: ComponentFixture<SegmentChannelAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SegmentChannelAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SegmentChannelAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
