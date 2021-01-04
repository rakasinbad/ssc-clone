import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelSelectSearchMultiComponent } from './channel-select-search-multi.component';

describe('ChannelSelectSearchMultiComponent', () => {
  let component: ChannelSelectSearchMultiComponent;
  let fixture: ComponentFixture<ChannelSelectSearchMultiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelSelectSearchMultiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelSelectSearchMultiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
