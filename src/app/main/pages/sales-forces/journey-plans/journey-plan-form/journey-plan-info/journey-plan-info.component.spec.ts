import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneyPlanInfoComponent } from './journey-plan-info.component';

describe('JourneyPlanInfoComponent', () => {
  let component: JourneyPlanInfoComponent;
  let fixture: ComponentFixture<JourneyPlanInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JourneyPlanInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JourneyPlanInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
