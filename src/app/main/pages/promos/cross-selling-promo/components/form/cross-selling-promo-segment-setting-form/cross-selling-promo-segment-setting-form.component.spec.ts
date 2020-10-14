import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossSellingPromoSegmentSettingFormComponent } from './cross-selling-promo-segment-setting-form.component';

describe('CrossSellingPromoSegmentSettingFormComponent', () => {
  let component: CrossSellingPromoSegmentSettingFormComponent;
  let fixture: ComponentFixture<CrossSellingPromoSegmentSettingFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrossSellingPromoSegmentSettingFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossSellingPromoSegmentSettingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
