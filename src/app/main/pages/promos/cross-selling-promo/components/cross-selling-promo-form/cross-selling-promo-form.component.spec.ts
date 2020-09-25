import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossSellingPromoFormComponent } from './cross-selling-promo-form.component';

describe('CrossSellingPromoFormComponent', () => {
  let component: CrossSellingPromoFormComponent;
  let fixture: ComponentFixture<CrossSellingPromoFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrossSellingPromoFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossSellingPromoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
