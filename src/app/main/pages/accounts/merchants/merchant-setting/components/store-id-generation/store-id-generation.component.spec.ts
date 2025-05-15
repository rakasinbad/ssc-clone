import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantSettingStoreIdGenerationComponent } from './store-id-generation.component';

describe('MerchantSettingStoreIdGenerationComponent', () => {
  let component: MerchantSettingStoreIdGenerationComponent;
  let fixture: ComponentFixture<MerchantSettingStoreIdGenerationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantSettingStoreIdGenerationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantSettingStoreIdGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
