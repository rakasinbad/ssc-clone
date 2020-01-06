import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneyPlanFormComponent } from './journey-plan-form.component';

describe('JourneyPlanFormComponent', () => {
  let component: JourneyPlanFormComponent;
  let fixture: ComponentFixture<JourneyPlanFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JourneyPlanFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JourneyPlanFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
