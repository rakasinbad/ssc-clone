import { HelperService } from 'app/shared/helpers';

interface ExportFilterFormConfiguration {
    required: boolean;
    placeholder?: string;
    label?: string;
}

export interface ExportFormFilterConfiguration {
    requireFilter?: boolean;
    filterAspect?: {
        status?: ExportFilterFormConfiguration,
        rangeDate?: ExportFilterFormConfiguration & {
            maxRange: {
                number: number,
                duration: 'year' | 'month' | 'week' | 'day',
            }
        },
    };
}

export type ExportFilterConfiguration = {
    [pages in ExportConfiguration['page']]?: ExportFormFilterConfiguration;
};

export interface ExportFormData {
    dateGte?: string;
    dateLte?: string;
    status?: string;
}

export interface ExportConfiguration {
    // Tipe halaman harus diisi untuk menentukan export yang dibutuhkan.
    page: '' | 'stores' | 'catalogues' | 'payments' | 'orders' | 'portfolios' | 'journey-plans';
    // Menentukan konfigurasi setiap export.
    configuration?: ExportFilterConfiguration;
}

export const defaultExportFilterConfiguration: ExportFilterConfiguration = {
    'orders': {
        requireFilter: true,
        filterAspect: {
            status: {
                label: 'Order Status',
                placeholder: 'Choose Order Status',
                required: true
            },
            rangeDate: {
                required: true,
                maxRange: {
                    number: 1,
                    duration: 'month'
                }
            }
        }
    },
    'catalogues': {
        requireFilter: true,
        filterAspect: {
            status: {
                label: 'Catalogue Status',
                placeholder: 'Choose Catalogue Status',
                required: true
            },
            rangeDate: {
                required: true,
                maxRange: {
                    number: 1,
                    duration: 'month'
                }
            }
        }
    },
    'payments': {
        requireFilter: true,
        filterAspect: {
            status: {
                label: 'Payment Status',
                placeholder: 'Choose Payment Status',
                required: true
            },
            rangeDate: {
                required: true,
                maxRange: {
                    number: 1,
                    duration: 'month'
                }
            }
        }
    },
    'stores': {
        requireFilter: true,
        filterAspect: {
            status: {
                label: 'Store List Status',
                placeholder: 'Choose Store List Status',
                required: true
            },
            rangeDate: {
                required: true,
                maxRange: {
                    number: 1,
                    duration: 'month'
                }
            }
        }
    },
    'journey-plans': {
        requireFilter: true,
        filterAspect: {
            rangeDate: {
                required: true,
                maxRange: {
                    number: 1,
                    duration: 'month'
                }
            }
        }
    },
    'portfolios': {
        requireFilter: false,
    },
};