export const globalIdLang = {
    ACTION: {
        ACTIVE: 'Active',
        ARCHIVE: 'Archive',
        INACTIVE: 'Inactive',
        PRINT: 'Cetak',
        EDIT: 'Edit',
        REMOVE: 'Remove',
    },
    BREADCRUMBS: {
        ACCOUNTS: 'Account',
        ACCOUNT: 'Store',
        ACCOUNTS_SETTINGS: 'Pengaturan Akun',
        ADD_PRODUCT: 'Add Product',
        ADD_STORE: 'Add Toko',
        ATTENDANCES: 'Attendances',
        CATALOGUE: 'Catalogue',
        CREDIT_LIMIT_BALANCE: 'Credit Limit / Balance',
        CREATE: 'Create',
        DETAIL: 'Detail',
        EDIT: 'Edit',
        EDIT_PRODUCT: 'Edit Produk',
        EDIT_STORE: 'Edit Toko',
        EDIT_USER: 'Edit User',
        FINANCE: 'Finance',
        HOME: 'Beranda',
        INTERNAL: 'Internal',
        IN_STORE_INVENTORY: 'In-Store Inventory',
        INVENTORY: 'Inventory',
        MANAGE_PRODUCT: 'Manage Product',
        MERCHANTS: 'Merchants',
        MERCHANT: 'Merchant',
        ORDER_DETAILS: 'Order Detail',
        ORDER_MANAGEMENTS: 'Order Management',
        PAYMENT_STATUS: 'Payment Status',
        SALES_REP_MANAGEMENT: 'Sales Management',
        SET_BANK: 'Set Bank',
        STORES: 'Stores',
        STORE: 'Store List',
        SUPPLIER_INVENTORY: 'Supplier Inventory',
    },
    FORM: {
        ACCOUNT: 'Akun',
        CHECK_IN: 'Check In',
        CHECK_OUT: 'Check Out',
        CONFIRM_PASSWORD: 'Confirm Password',
        DEFAULT: 'This',
        EMAIL: 'E-mail',
        FULL_NAME: 'Nama Lengkap',
        LAT: 'Latitude',
        LATITUDE: 'Latitude',
        LNG: 'Longitude',
        LONGITUDE: 'Longitude',
        MOBILE_PHONE: 'Mobile Phone',
        NAME: 'Nama',
        NEW_PASSWORD: 'New Password',
        PASSWORD: 'Password',
        PHONE: 'Phone',
        PHONE_NUMBER: 'Phone Number',
        PRODUCT_PHOTO: 'Product Photo',
        PRODUCT_TAG: 'Product Tag',
        ROLE: 'Role',
        STATUS: 'Status',
        USERNAME: 'Username',
    },
    GLOBAL_STATUS: {
        ALL: 'All',
        ARCHIVED: 'Archive',
        BLOCKED: 'Blocked',
        COMPLETED: 'Done',
        EMPTY: 'Empety',
        NEW_ORDER: 'New Order',
        PACKING: 'Packed',
        RECEIVED: 'Delivered',
        SHIPPED: 'Shipped',
        TO_BE_SHIPPED: 'Ready To Ship',
    },
    ERROR: {
        ALPHA_PATTERN: '{{ fieldName }} field may only contain letters.',
        ALPHA_NUM_PATTERN: '{{ fieldName }} field may only contain letters and numbers.',
        BETWEEN_GT_NUMBER: '{{ fieldName }} field must be > {{ minValue }} and <= {{ maxValue }}.',
        BETWEEN_LT_NUMBER: '{{ fieldName }} field must be >= {{ minValue }} and < {{ maxValue }}.',
        BETWEEN_NUMBER: '{{ fieldName }} field must be between {{ minValue }} and {{ maxValue }}.',
        CONFIRM: '{{ fieldName }} field does not match the {{ fieldNameCompare }} field.',
        CONFIRM_UNKNOWN: '{{ fieldName }} field does not match the other fields.',
        DEFAULT: '{{ fieldName }} field is required or selected.',
        DIFFERENT: '{{ fieldName }} field cannot as same as {{ fieldComparedName }}.',
        DIGIT: '{{ fieldName }} field must digit.',
        EMAIL_PATTERN: '{{ fieldName }} field must contain a valid email address.',
        FILE_SIZE: '{{ fieldName }} field must be {{ size }}',
        FILE_SIZE_LTE: '{{ fieldName }} field must be less than or equal {{ size }}',
        FORMAT: '{{ fieldName }} field only with the following extensions are allowed: {{ ext }}.',
        GT_NUMBER: '{{ fieldName }} field must be greater than {{ minValue }}.',
        GTE_NUMBER: '{{ fieldName }} field must be greater than or equal {{ limitValue }}.',
        IS_UNIQUE: '{{ fieldName }} field has already been taken.',
        IS_UNIQUE_EMAIL: '{{ fieldName }} field already registered.',
        LT_NUMBER: '{{ fieldName }} field must be less than {{ maxValue }}.',
        LTE_NUMBER: '{{ fieldName }} field must be less than or equal {{ limitValue }}.',
        MAX: '{{ fieldName }} field may not be greater than {{ maxValue }}.',
        MAX_LENGTH: '{{ fieldName }} field may not be greater than {{ maxValue }} characters.',
        MIN: '{{ fieldName }} field must be at least {{ minValue }}.',
        MIN_1_PHOTO: '{{ fieldName }} field must have at least 1 photo.',
        MIN_1_TAG: '{{ fieldName }} field must have at least 1 tag.',
        MIN_LENGTH: '{{ fieldName }} field must be at least {{ minLength }} characters.',
        MOBILE_PHONE_LENGTH_PATTERN:
            '{{ fieldName }} field must contain a valid (prefix: {{ prefix }}, length: {{ length }}).',
        MOBILE_PHONE_PATTERN: '{{ fieldName }} field must contain a valid (prefix: {{ prefix }}).',
        NOT_FOUND: '{{ fieldName }} field not found.',
        NUMERIC: '{{ fieldName }} field must be a number.',
        // tslint:disable-next-line: quotemark
        PASS_UNMEET_SPEC: "{{ fieldName }} does not meet the password's minimum specification.",
        PATTERN: '{{ fieldName }} field format is invalid.',
        REQUIRED: '{{ fieldName }} field is required.',
        SELECTED: '{{ fieldName }} field must be selected.',
        TYPE_EMAIL: '{{ fieldName }} field must contain a valid email address.',
        TYPE_PHONE: '{{ fieldName }} field must a valid mobile phone number.',
        TYPE_PHONE_PREFIX:
            '{{ fieldName }} field must a valid mobile phone number (prefix: {{ prefix }}).',
    },
};
