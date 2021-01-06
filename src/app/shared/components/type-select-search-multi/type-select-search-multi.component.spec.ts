import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeSelectSearchMultiComponent } from './type-select-search-multi.component';

describe('TypeSelectSearchMultiComponent', () => {
  let component: TypeSelectSearchMultiComponent;
  let fixture: ComponentFixture<TypeSelectSearchMultiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypeSelectSearchMultiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeSelectSearchMultiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
