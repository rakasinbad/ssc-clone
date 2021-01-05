import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSelectSearchMultiComponent } from './group-select-search-multi.component';

describe('GroupSelectSearchMultiComponent', () => {
  let component: GroupSelectSearchMultiComponent;
  let fixture: ComponentFixture<GroupSelectSearchMultiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupSelectSearchMultiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupSelectSearchMultiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
