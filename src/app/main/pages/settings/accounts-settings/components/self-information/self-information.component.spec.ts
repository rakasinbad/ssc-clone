import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfInformationComponent } from './self-information.component';

describe('SelfInformationComponent', () => {
  let component: SelfInformationComponent;
  let fixture: ComponentFixture<SelfInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelfInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
