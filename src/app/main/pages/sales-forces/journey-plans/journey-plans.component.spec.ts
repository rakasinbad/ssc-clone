import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneyPlansComponent } from './journey-plans.component';

describe('JourneyPlansComponent', () => {
  let component: JourneyPlansComponent;
  let fixture: ComponentFixture<JourneyPlansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JourneyPlansComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JourneyPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
