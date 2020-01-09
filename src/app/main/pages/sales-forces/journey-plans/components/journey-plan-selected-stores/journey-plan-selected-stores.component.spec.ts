import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneyPlanSelectedStoresComponent } from './journey-plan-selected-stores.component';

describe('JourneyPlanSelectedStoresComponent', () => {
  let component: JourneyPlanSelectedStoresComponent;
  let fixture: ComponentFixture<JourneyPlanSelectedStoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JourneyPlanSelectedStoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JourneyPlanSelectedStoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
