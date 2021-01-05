import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SinbadSelectSearchComponent } from './sinbad-select-search.component';

describe('SinbadSelectSearchComponent', () => {
  let component: SinbadSelectSearchComponent;
  let fixture: ComponentFixture<SinbadSelectSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SinbadSelectSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SinbadSelectSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
