import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossSellingPromoFormPageComponent } from './cross-selling-promo-form-page.component';

describe('CrossSellingPromoFormPageComponent', () => {
  let component: CrossSellingPromoFormPageComponent;
  let fixture: ComponentFixture<CrossSellingPromoFormPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrossSellingPromoFormPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossSellingPromoFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
