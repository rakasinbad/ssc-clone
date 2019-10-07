export const globalEnLang = {
    FORM: {
        ACCOUNT: 'Account',
        CHECK_IN: 'Check In',
        CHECK_OUT: 'Check Out',
        EMAIL: 'E-mail',
        FULL_NAME: 'Full Name',
        LAT: 'Latitude',
        LATITUDE: 'Latitude',
        LNG: 'Longitude',
        LONGITUDE: 'Longitude',
        MOBILE_PHONE: 'Mobile Phone',
        NAME: 'Name',
        PASSWORD: 'Password',
        PHONE: 'Phone',
        STATUS: 'Status',
        USERNAME: 'Username'
    },
    ERROR: {
        ALPHA_PATTERN: '{{ fieldName }} field must alphabets.',
        CONFIRM: '{{ fieldName }} field does not match the {{ fieldNameCompare }} field.',
        CONFIRM_UNKNOWN: '{{ fieldName }} field does not match the other fields.',
        DEFAULT: '{{ fieldName }} field is required or selected.',
        DIGIT: '{{ fieldName }} field must digit.',
        EMAIL_PATTERN: '{{ fieldName }} field must contain a valid email address.',
        FORMAT: '{{ fieldName }} field only with the following extensions are allowed: {{ ext }}.',
        IS_UNIQUE: '{{ fieldName }} field has already been taken.',
        IS_UNIQUE_EMAIL: '{{ fieldName }} field already registered.',
        MAX: '{{ fieldName }} field may not be greater than {{ maxValue }}.',
        MAX_LENGTH: '{{ fieldName }} field may not be greater than {{ maxValue }} characters.',
        MIN: '{{ fieldName }} field must be at least {{ minValue }}.',
        MIN_LENGTH: '{{ fieldName }} field must be at least {{ minLength }} characters.',
        MOBILE_PHONE_LENGTH_PATTERN:
            '{{ fieldName }} field must contain a valid (prefix: {{ prefix }}, length: {{ length }}).',
        MOBILE_PHONE_PATTERN: '{{ fieldName }} field must contain a valid (prefix: {{ prefix }}).',
        NOT_FOUND: '{{ fieldName }} field not found.',
        NUMERIC: '{{ fieldName }} field must number.',
        PATTERN: '{{ fieldName }} field must valid.',
        REQUIRED: '{{ fieldName }} field is required.',
        SELECTED: '{{ fieldName }} field must be selected.',
        TYPE_EMAIL: '{{ fieldName }} field must contain a valid email address.',
        TYPE_PHONE: '{{ fieldName }} field must a valid mobile phone number.',
        TYPE_PHONE_PREFIX:
            '{{ fieldName }} field must a valid mobile phone number (prefix: {{ prefix }}).'
    }
};
