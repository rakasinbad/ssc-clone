import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfoliosConflictStoresComponent } from './portfolios-conflict-stores.component';

describe('PortfoliosConflictStoresComponent', () => {
  let component: PortfoliosConflictStoresComponent;
  let fixture: ComponentFixture<PortfoliosConflictStoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfoliosConflictStoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfoliosConflictStoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
