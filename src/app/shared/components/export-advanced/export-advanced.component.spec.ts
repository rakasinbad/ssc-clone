import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportAdvancedComponent } from './export-advanced.component';

describe('ExportAdvancedComponent', () => {
  let component: ExportAdvancedComponent;
  let fixture: ComponentFixture<ExportAdvancedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportAdvancedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
