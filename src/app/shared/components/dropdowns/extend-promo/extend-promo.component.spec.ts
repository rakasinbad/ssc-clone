import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendPromoComponent } from './extend-promo.component';

describe('ExtendPromoComponent', () => {
  let component: ExtendPromoComponent;
  let fixture: ComponentFixture<ExtendPromoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtendPromoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendPromoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
