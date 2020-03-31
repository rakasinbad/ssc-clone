import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyDialogComponent } from './apply-dialog.component';

describe('ApplyDialogComponent', () => {
  let component: ApplyDialogComponent;
  let fixture: ComponentFixture<ApplyDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplyDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
