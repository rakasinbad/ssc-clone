import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneyPlanStoreComponent } from './journey-plan-store.component';

describe('JourneyPlanStoreComponent', () => {
  let component: JourneyPlanStoreComponent;
  let fixture: ComponentFixture<JourneyPlanStoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JourneyPlanStoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JourneyPlanStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
