import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SinbadAutocompleteComponent } from './sinbad-autocomplete.component';

describe('SinbadAutocompleteComponent', () => {
  let component: SinbadAutocompleteComponent;
  let fixture: ComponentFixture<SinbadAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SinbadAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SinbadAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
