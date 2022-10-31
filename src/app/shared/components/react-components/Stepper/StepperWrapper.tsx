import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Stepper } from './Stepper';

const containerElementName = 'stepperComponentContainer';

@Component({
    selector: 'app-stepper',
    template: `<div #${containerElementName}></div>`,
    styleUrls: ['./stepper-wrapper.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class StepperWrapper implements OnChanges, OnDestroy, AfterViewInit {
    @ViewChild(containerElementName, { static: true }) containerRef!: ElementRef;

    @Input() public stepperConfig = [
        {
          id: "1",
          title: "Mock Title #1",
          description: "description 1",
        },
        {
          id: "2",
          title: "Mock Title #2",
          description: "description 2",
        },
        {
          id: "3",
          title: "Mock Title #3",
          description: "description 3",
        }
    ];

    @Input()
    public initialActiveIndex: number; 

    constructor() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.render();
    }

    ngAfterViewInit() {
        this.render();
    }

    ngOnDestroy() {
        ReactDOM.unmountComponentAtNode(this.containerRef.nativeElement);
    }

    private render() {
        ReactDOM.render(
            <React.StrictMode>
                <div>
                    <Stepper 
                        stepperConfig={this.stepperConfig} initialActiveIndex={this.initialActiveIndex}
                    />
                </div>
            </React.StrictMode>
            , this.containerRef.nativeElement
        );
    }
}
