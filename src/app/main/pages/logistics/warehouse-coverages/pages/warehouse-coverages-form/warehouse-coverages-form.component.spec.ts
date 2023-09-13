import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseCoveragesFormComponent } from './warehouse-coverages-form.component';

describe('WarehouseCoveragesFormComponent', () => {
  let component: WarehouseCoveragesFormComponent;
  let fixture: ComponentFixture<WarehouseCoveragesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseCoveragesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseCoveragesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
