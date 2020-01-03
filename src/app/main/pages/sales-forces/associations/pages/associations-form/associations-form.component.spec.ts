import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociationsFormComponent } from './associations-form.component';

describe('AssociationsFormComponent', () => {
  let component: AssociationsFormComponent;
  let fixture: ComponentFixture<AssociationsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociationsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociationsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
