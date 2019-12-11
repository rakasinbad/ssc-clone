import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoNoticeComponent } from './info-notice.component';

describe('InfoNoticeComponent', () => {
  let component: InfoNoticeComponent;
  let fixture: ComponentFixture<InfoNoticeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoNoticeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
