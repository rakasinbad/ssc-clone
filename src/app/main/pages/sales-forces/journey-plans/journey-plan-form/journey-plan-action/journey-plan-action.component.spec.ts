import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneyPlanActionComponent } from './journey-plan-action.component';

describe('JourneyPlanActionComponent', () => {
  let component: JourneyPlanActionComponent;
  let fixture: ComponentFixture<JourneyPlanActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JourneyPlanActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JourneyPlanActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
