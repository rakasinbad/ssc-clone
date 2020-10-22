import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossSellingPromoGeneralInfoFormComponent } from './cross-selling-promo-general-info-form.component';

describe('CrossSellingPromoGeneralInfoFormComponent', () => {
  let component: CrossSellingPromoGeneralInfoFormComponent;
  let fixture: ComponentFixture<CrossSellingPromoGeneralInfoFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrossSellingPromoGeneralInfoFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossSellingPromoGeneralInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
