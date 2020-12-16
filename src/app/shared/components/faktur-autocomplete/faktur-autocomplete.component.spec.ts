import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FakturAutocompleteComponent } from './faktur-autocomplete.component';

describe('FakturAutocompleteComponent', () => {
  let component: FakturAutocompleteComponent;
  let fixture: ComponentFixture<FakturAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FakturAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FakturAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
