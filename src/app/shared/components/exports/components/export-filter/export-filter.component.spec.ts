import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportFilterComponent } from './export-filter.component';

describe('ExportFilterComponent', () => {
  let component: ExportFilterComponent;
  let fixture: ComponentFixture<ExportFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
