import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendStoreDialogComponent } from './resend-store-dialog.component';

describe('ResendStoreDialogComponent', () => {
  let component: ResendStoreDialogComponent;
  let fixture: ComponentFixture<ResendStoreDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResendStoreDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResendStoreDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
