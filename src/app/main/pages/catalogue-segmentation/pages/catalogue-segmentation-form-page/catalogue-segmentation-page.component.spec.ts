import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogueSegmentationFormPageComponent } from './catalogue-segmentation-form-page.component';

describe('CatalogueSegmentationFormPageComponent', () => {
    let component: CatalogueSegmentationFormPageComponent;
    let fixture: ComponentFixture<CatalogueSegmentationFormPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CatalogueSegmentationFormPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CatalogueSegmentationFormPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
