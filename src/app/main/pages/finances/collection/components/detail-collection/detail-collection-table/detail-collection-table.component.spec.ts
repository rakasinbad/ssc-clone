import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailCollectionTableComponent } from './detail-collection-table.component';

describe('DetailCollectionTableComponent', () => {
  let component: DetailCollectionTableComponent;
  let fixture: ComponentFixture<DetailCollectionTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailCollectionTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailCollectionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
