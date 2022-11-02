import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    templateUrl: './proof-of-payment-form.component.html',
    styleUrls: ['./proof-of-payment-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProofOfPaymentFormComponent implements OnInit {
    form: FormGroup;

    constructor(private formBuilder: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.form = this.formBuilder.group({
            status: [''],
            reason: ['']
        });
    }

    removeMagnify(): void {
        const glass = document.getElementsByClassName('img-magnifier-glass');

        if (glass.length > 0) {
            glass[0].remove();
        }
    }

    showMagnify(imgID: string, zoom: number): void {
        const img: any = document.getElementById(imgID);

        // create magnifier glass:
        const glass = document.createElement('DIV');

        glass.setAttribute('class', 'img-magnifier-glass');

        //  insert magnifier glass:
        img.parentElement.insertBefore(glass, img);

        // set background properties for the magnifier glass:
        glass.style.backgroundImage = "url('" + img.src + "')";
        glass.style.backgroundRepeat = 'no-repeat';
        glass.style.backgroundSize = img.width * zoom + 'px ' + img.height * zoom + 'px';

        const bw = 3;
        const w = glass.offsetWidth / 2;
        const h = glass.offsetHeight / 2;

        // execute a function when someone moves the magnifier glass over the image:
        glass.addEventListener('mousemove', $event =>
            this.moveMagnifier($event, glass, img, h, w, bw, zoom)
        );
        img.addEventListener('mousemove', $event =>
            this.moveMagnifier($event, glass, img, h, w, bw, zoom)
        );

        // and also for touch screens:
        glass.addEventListener('touchmove', $event =>
            this.moveMagnifier($event, glass, img, h, w, bw, zoom)
        );
        img.addEventListener('touchmove', $event =>
            this.moveMagnifier($event, glass, img, h, w, bw, zoom)
        );

        // var img, glass, w, h, bw;
        // img = document.getElementById(imgID);
        // /*create magnifier glass:*/
        // glass = document.createElement('DIV');
        // glass.setAttribute('class', 'img-magnifier-glass');
        /*insert magnifier glass:*/
        // img.parentElement.insertBefore(glass, img);
        /*set background properties for the magnifier glass:*/
        // glass.style.backgroundImage = 'url(\'' + img.src + '\')';
        // glass.style.backgroundRepeat = 'no-repeat';
        // glass.style.backgroundSize = img.width * zoom + 'px ' + img.height * zoom + 'px';

        // bw = 3;
        // w = glass.offsetWidth / 2;
        // h = glass.offsetHeight / 2;

        /*execute a function when someone moves the magnifier glass over the image:*/
        // glass.addEventListener('mousemove', moveMagnifier);
        // img.addEventListener('mousemove', moveMagnifier);
        /*and also for touch screens:*/
        // glass.addEventListener('touchmove', moveMagnifier);
        // img.addEventListener('touchmove', moveMagnifier);

        // function moveMagnifier(e) {
        //     let pos, x, y;
        //     /*prevent any other actions that may occur when moving over the image*/
        //     e.preventDefault();
        //     /*get the cursor's x and y positions:*/
        //     pos = getCursorPos(e);
        //     x = pos.x;
        //     y = pos.y;
        //     /*prevent the magnifier glass from being positioned outside the image:*/
        //     if (x > img.width - w / zoom) {
        //         x = img.width - w / zoom;
        //     }
        //     if (x < w / zoom) {
        //         x = w / zoom;
        //     }
        //     if (y > img.height - h / zoom) {
        //         y = img.height - h / zoom;
        //     }
        //     if (y < h / zoom) {
        //         y = h / zoom;
        //     }
        //     /*set the position of the magnifier glass:*/
        //     glass.style.left = x - w + 'px';
        //     glass.style.top = y - h + 'px';
        //     /*display what the magnifier glass "sees":*/
        //     glass.style.backgroundPosition =
        //         '-' + (x * zoom - w + bw) + 'px -' + (y * zoom - h + bw) + 'px';
        // }

        // function getCursorPos(e) {
        //     let a,
        //         x = 0,
        //         y = 0;
        //     e = e || window.event;
        //     /*get the x and y positions of the image:*/
        //     a = img.getBoundingClientRect();
        //     /*calculate the cursor's x and y coordinates, relative to the image:*/
        //     x = e.pageX - a.left;
        //     y = e.pageY - a.top;
        //     /*consider any page scrolling:*/
        //     x = x - window.pageXOffset;
        //     y = y - window.pageYOffset;
        //     return { x: x, y: y };
        // }
    }

    private moveMagnifier(
        e: any,
        glass: any,
        img: any,
        h: any,
        w: any,
        bw: any,
        zoom: number
    ): void {
        e.preventDefault();

        const pos = this.getCursorPos(e, img);
        let x = pos.x;
        let y = pos.y;

        if (x > img.width - w / zoom) {
            x = img.width - w / zoom;
        }

        if (x < w / zoom) {
            x = w / zoom;
        }

        if (y > img.height - h / zoom) {
            y = img.height - h / zoom;
        }

        if (y < h / zoom) {
            y = h / zoom;
        }

        // set the position of the magnifier glass:
        glass.style.left = x - w + 'px';
        glass.style.top = y - h + 'px';

        // display what the magnifier glass "sees":
        glass.style.backgroundPosition =
            '-' + (x * zoom - w + bw) + 'px -' + (y * zoom - h + bw) + 'px';
    }

    private getCursorPos(e: any, img: any): any {
        let x = 0;
        let y = 0;

        e = e || window.event;

        // get the x and y positions of the image:
        const a = img.getBoundingClientRect();

        // calculate the cursor's x and y coordinates, relative to the image:
        x = e.pageX - a.left;
        y = e.pageY - a.top;

        // consider any page scrolling:
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;

        return {
            x: x,
            y: y
        };
    }
}
