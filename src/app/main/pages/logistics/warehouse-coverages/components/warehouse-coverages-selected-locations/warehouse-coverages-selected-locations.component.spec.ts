import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseCoveragesSelectedLocationsComponent } from './warehouse-coverages-selected-locations.component';

describe('WarehouseCoveragesSelectedLocationsComponent', () => {
  let component: WarehouseCoveragesSelectedLocationsComponent;
  let fixture: ComponentFixture<WarehouseCoveragesSelectedLocationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseCoveragesSelectedLocationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseCoveragesSelectedLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
