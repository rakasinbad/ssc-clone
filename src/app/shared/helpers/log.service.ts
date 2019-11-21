import { Injectable, isDevMode } from '@angular/core';

import { ILog, TLogMode } from '../models/global.model';

@Injectable({
    providedIn: 'root'
})
export class LogService {
    constructor() {}

    generateGroup(title: string, content: ILog | string, mode?: TLogMode): void {
        if (isDevMode()) {
            console.groupCollapsed(title);

            if (mode === 'default') {
                console.log(content);
            } else {
                Object.entries(content).forEach(([k, { type, value }]) => {
                    switch (mode) {
                        case 'table':
                            console.groupCollapsed(k);
                            console.table(value);
                            console.groupEnd();
                            break;

                        case 'group':
                            console.group(k);

                            if (type === 'error') {
                                console.error(value);
                            }

                            if (type === 'info') {
                                console.info(value);
                            }

                            if (type === 'log') {
                                console.log(value);
                            }

                            if (type === 'warn') {
                                console.warn(value);
                            }

                            console.groupEnd();
                            break;

                        case 'groupCollapsed':
                        default:
                            console.groupCollapsed(k);

                            if (type === 'error') {
                                console.error(value);
                            }

                            if (type === 'info') {
                                console.info(value);
                            }

                            if (type === 'log') {
                                console.log(value);
                            }

                            if (type === 'warn') {
                                console.warn(value);
                            }

                            console.groupEnd();
                            break;
                    }
                });
            }

            console.groupEnd();
        }
    }
}
