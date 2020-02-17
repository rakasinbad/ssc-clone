import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateHistoryComponent } from './template-history.component';

describe('TemplateHistoryComponent', () => {
  let component: TemplateHistoryComponent;
  let fixture: ComponentFixture<TemplateHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
