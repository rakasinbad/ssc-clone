import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossSellingPromoBenefitFormComponent } from './cross-selling-promo-benefit-form.component';

describe('CrossSellingPromoBenefitFormComponent', () => {
  let component: CrossSellingPromoBenefitFormComponent;
  let fixture: ComponentFixture<CrossSellingPromoBenefitFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrossSellingPromoBenefitFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossSellingPromoBenefitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
