import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfoliosFormComponent } from './portfolios-form.component';

describe('PortfoliosFormComponent', () => {
  let component: PortfoliosFormComponent;
  let fixture: ComponentFixture<PortfoliosFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfoliosFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfoliosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
