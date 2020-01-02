import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesRepFormComponent } from './sales-rep-form.component';

describe('SalesRepFormComponent', () => {
  let component: SalesRepFormComponent;
  let fixture: ComponentFixture<SalesRepFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesRepFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesRepFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
