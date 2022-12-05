import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantSettingComponent } from './merchant-setting.component';

describe('MerchantSettingComponent', () => {
  let component: MerchantSettingComponent;
  let fixture: ComponentFixture<MerchantSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
