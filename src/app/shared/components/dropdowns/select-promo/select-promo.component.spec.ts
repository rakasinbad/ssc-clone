import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPromoComponent } from './select-promo.component';

describe('SelectPromoComponent', () => {
  let component: SelectPromoComponent;
  let fixture: ComponentFixture<SelectPromoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectPromoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectPromoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
