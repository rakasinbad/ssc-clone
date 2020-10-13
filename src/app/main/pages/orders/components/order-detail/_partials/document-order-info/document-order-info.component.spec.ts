import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentOrderInfoComponent } from './document-order-info.component';

describe('DocumentOrderInfoComponent', () => {
  let component: DocumentOrderInfoComponent;
  let fixture: ComponentFixture<DocumentOrderInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentOrderInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentOrderInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
