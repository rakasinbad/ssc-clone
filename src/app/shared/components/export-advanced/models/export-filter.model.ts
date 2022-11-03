import { IQueryParams } from "app/shared/models/query.model";

interface ExportFilterFormConfiguration {
    required: boolean;
    placeholder?: string;
    label?: string;
}

export interface ExportFormFilterConfiguration {
    requireFilter?: boolean;
    filterAspect?: {
        status?: ExportFilterFormConfiguration;
        type?: ExportFilterFormConfiguration;
        warehouse?: ExportFilterFormConfiguration;
        rangeDate?: ExportFilterFormConfiguration & {
            maxRange: {
                number: number;
                duration: 'year' | 'month' | 'week' | 'day';
            };
        };
    };
}

export type ExportFilterConfiguration = {
    [pages in ExportConfigurationPage]?: ExportFormFilterConfiguration;
};

export interface ExportFormData {
    dateGte?: string;
    dateLte?: string;
    status?: string;
    type?: string;
    warehouse?: any;
    viewHistory?: boolean;
}

export type ExportConfigurationPage =
    | ''
    | 'supplier-stores'
    | 'stores'
    | 'catalogues'
    | 'payments'
    | 'invoices'
    | 'orders'
    | 'portfolios'
    | 'journey-plans'
    | 'sr-assignment'
    | 'sales-rep'
    | 'warehouses'
    | 'returns'

export interface ExportConfiguration {
    // Tipe halaman harus diisi untuk menentukan export yang dibutuhkan.
    page: ExportConfigurationPage;

    // Menentukan konfigurasi setiap export.
    configuration?: ExportFilterConfiguration;
}

export interface IFetchStatusList {
    params?: IQueryParams;
    customUrl?: string;
}

export const defaultExportFilterConfiguration: ExportFilterConfiguration = {
    orders: {
        requireFilter: true,
        filterAspect: {
            status: {
                label: 'Order Status',
                placeholder: 'Choose Order Status',
                required: true,
            },
            rangeDate: {
                required: true,
                maxRange: {
                    number: 1,
                    duration: 'month',
                },
            },
        },
    },
    catalogues: {
        requireFilter: true,
        filterAspect: {
            status: {
                label: 'Catalogue Status',
                placeholder: 'Choose Catalogue Status',
                required: true,
            },
            type: {
                label: 'Catalogue Type',
                placeholder: 'Choose Catalogue Type',
                required: true,
            },
            warehouse: {
                label: 'Warehouse',
                placeholder: 'Choose Warehouse',
                required: true,
            },
        },
    },
    payments: {
        requireFilter: true,
        filterAspect: {
            status: {
                label: 'Payment Status',
                placeholder: 'Choose Payment Status',
                required: true,
            },
            rangeDate: {
                required: true,
                maxRange: {
                    number: 1,
                    duration: 'month',
                },
            },
        },
    },
    invoices: {
        requireFilter: true,
        filterAspect: {
            status: {
                label: 'Payment Status',
                placeholder: 'Choose Payment Status',
                required: true,
            },
            rangeDate: {
                required: true,
                maxRange: {
                    number: 1,
                    duration: 'month',
                },
            },
        },
    },
    stores: {
        requireFilter: true,
        filterAspect: {
            status: {
                label: 'Store List Status',
                placeholder: 'Choose Store List Status',
                required: true,
            },
            rangeDate: {
                required: false,
                maxRange: {
                    number: 1,
                    duration: 'month',
                },
            },
        },
    },
    'supplier-stores': {
        requireFilter: true,
        filterAspect: {
            status: {
                label: 'Store List Status',
                placeholder: 'Choose Store List Status',
                required: true,
            },
            rangeDate: {
                required: false,
                maxRange: {
                    number: 1,
                    duration: 'month',
                },
            },
        },
    },
    'journey-plans': {
        requireFilter: true,
        filterAspect: {
            rangeDate: {
                required: true,
                maxRange: {
                    number: 1,
                    duration: 'month',
                },
            },
        },
    },
    portfolios: {
        requireFilter: false,
    },
    'sr-assignment': {
        requireFilter: true,
        filterAspect: {
            status: {
                label: 'SR Assignment Status',
                placeholder: 'Choose SR Assignment Status',
                required: true,
            },
            rangeDate: {
                required: false,
                maxRange: {
                    number: 1,
                    duration: 'month',
                },
            },
        },
    },
    'sales-rep': {
        requireFilter: true,
        filterAspect: {
            status: {
                label: 'Sales Rep Status',
                placeholder: 'Choose Sales Rep Status',
                required: true,
            },
            rangeDate: {
                required: false,
                maxRange: {
                    number: 1,
                    duration: 'month',
                },
            },
        },
    },
    warehouses: {
        requireFilter: false,
    },
    returns: {
        requireFilter: true,
        filterAspect: {
            status: {
                label: 'Return Status',
                placeholder: 'Select Return Status',
                required: true
            },
            rangeDate: {
                required: true,
                maxRange: {
                    number: 9999,
                    duration: 'year',
                },
            },
        }
    }
};
