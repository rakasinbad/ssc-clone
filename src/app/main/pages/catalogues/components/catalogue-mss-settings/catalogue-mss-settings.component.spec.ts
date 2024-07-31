import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogueMssSettingsComponent } from './catalogue-mss-settings.component';

describe('CatalogueMssSettingsComponent', () => {
  let component: CatalogueMssSettingsComponent;
  let fixture: ComponentFixture<CatalogueMssSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogueMssSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogueMssSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
