import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAdvancedComponent } from './import-advanced.component';

describe('ImportAdvancedComponent', () => {
  let component: ImportAdvancedComponent;
  let fixture: ComponentFixture<ImportAdvancedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportAdvancedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
