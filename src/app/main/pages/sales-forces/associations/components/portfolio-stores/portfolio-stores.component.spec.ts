import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioStoresComponent } from './portfolio-stores.component';

describe('PortfolioStoresComponent', () => {
  let component: PortfolioStoresComponent;
  let fixture: ComponentFixture<PortfolioStoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioStoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioStoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
