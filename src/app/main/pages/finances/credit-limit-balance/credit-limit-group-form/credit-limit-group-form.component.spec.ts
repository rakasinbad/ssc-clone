import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditLimitGroupFormComponent } from './credit-limit-group-form.component';

describe('CreditLimitGroupFormComponent', () => {
  let component: CreditLimitGroupFormComponent;
  let fixture: ComponentFixture<CreditLimitGroupFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditLimitGroupFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditLimitGroupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
