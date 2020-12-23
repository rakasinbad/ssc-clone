import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusterSelectSearchMultiComponent } from './cluster-select-search-multi.component';

describe('ClusterSelectSearchMultiComponent', () => {
  let component: ClusterSelectSearchMultiComponent;
  let fixture: ComponentFixture<ClusterSelectSearchMultiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClusterSelectSearchMultiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterSelectSearchMultiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
