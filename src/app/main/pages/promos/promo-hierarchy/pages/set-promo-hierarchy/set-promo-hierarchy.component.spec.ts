import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetPromoHierarchyComponent } from './set-promo-hierarchy.component';

describe('SetPromoHierarchyComponent', () => {
  let component: SetPromoHierarchyComponent;
  let fixture: ComponentFixture<SetPromoHierarchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetPromoHierarchyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetPromoHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
