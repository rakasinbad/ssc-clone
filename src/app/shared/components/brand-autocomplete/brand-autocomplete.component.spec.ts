import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandAutocompleteComponent } from './brand-autocomplete.component';

describe('BrandAutocompleteComponent', () => {
  let component: BrandAutocompleteComponent;
  let fixture: ComponentFixture<BrandAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrandAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
