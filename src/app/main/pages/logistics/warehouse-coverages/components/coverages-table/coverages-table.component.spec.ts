import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoveragesTableComponent } from './coverages-table.component';

describe('CoveragesTableComponent', () => {
  let component: CoveragesTableComponent;
  let fixture: ComponentFixture<CoveragesTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoveragesTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoveragesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
