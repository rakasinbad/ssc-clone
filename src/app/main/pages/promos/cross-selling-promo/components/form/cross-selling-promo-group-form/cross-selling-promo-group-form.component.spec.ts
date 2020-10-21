import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossSellingPromoGroupFormComponent } from './cross-selling-promo-group-form.component';

describe('CrossSellingPromoGroupFormComponent', () => {
  let component: CrossSellingPromoGroupFormComponent;
  let fixture: ComponentFixture<CrossSellingPromoGroupFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrossSellingPromoGroupFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossSellingPromoGroupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
