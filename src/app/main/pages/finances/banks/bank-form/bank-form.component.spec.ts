import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankFormComponent } from './bank-form.component';

describe('BankFormComponent', () => {
  let component: BankFormComponent;
  let fixture: ComponentFixture<BankFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
