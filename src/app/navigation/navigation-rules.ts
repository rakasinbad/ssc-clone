export interface Routing {
  '*'? : boolean,
  'dashboard'? : ('')[],
  'account'? : ('' | 'stores' | 'store-setting' | 'internal' | 'store-segmentation' | '*')[],
  'profile'? : ('' | '*')[],
  'attendances'? : ( '' | 'detail' | 'employee' | '*')[],
  'finances'? : ( '' | 'credit-limit-balance' | 'payment-status' | '*')[],
  'orders'? : ('' | 'detail' | '*')[],
  'catalogues'? : ('' | 'list' | 'add' | 'edit' | 'view' | '*')[],
  'in-store-inventories'? : ('' | 'detail' | '*')[],
  'sales-force'? : ('' | 'sales-rep' | 'portfolio' | 'journey-plans' | 'workday-setting' | 'sr-target' | 'associations' | '*')[],
  'supplier-inventories'? : ('' | '*')[],
  'settings'? : ('' | 'accounts' | '*')[],
  'logistics'? : ('' | 'warehouses' | 'warehouse-coverages' | 'sku-assignments' | 'stock-managements' | '*')[],
  'promos'? : ('' | 'flexi-combo' | 'voucher' | 'cross-selling-promo' | '*')[],
  'catalogue-segmentations'? : ('' | 'add' | 'edit' | 'detail' | '*')[],
  'survey'? : ('' | 'response' | 'manage' | '*')[]
}

export interface Rule {
    role : string,
    routing : Routing,
    navbar : (
      'dashboard' |
      'account' |
      'accountsStore' | 
      'storeSetting' | 
      'storeSegmentation' |
      'catalogue' | 
      'manageProduct' |
      'segmentation' | 
      'attendance' |
      'finance' | 
      'creditLimitBalance' |
      'paymentStatus' |
      'orderManagement' |
      'inventory' |
      'instore' |
      'sales-force' |
      'sales-rep' |
      'portfolio' |
      'sr-target' |
      'association' |
      'journey-plan' |
      'workday-setting' |
      'warehouse' |
      'wh-list' |
      'wh-coverage' |
      'wh-sku-assignment' |
      'wh-stock-management' |
      'promo' |
      'flexi-combo'|
      'cross-selling-promo' |
      'period-target-promo' |
      'voucher' |
      'survey' |
      'survey-manage' | 
      'survey-response' |
      '*'
    )[],
    toolbar : ('Informasi Supplier' | 'Pengaturan akun' | 'Internal' | '*')[],
    redirectTo : string
}

export const Rules : Rule[] = [
    {
      role: 'SUPER_SUPPLIER_ADMIN',
      navbar: ['*'],
      routing: {'*' : true},
      toolbar: ['*'],
      redirectTo: '/pages/account/stores'
    },
    {
      role: 'FINANCE',
      navbar: [
        'account',
        'accountsStore',
        'storeSegmentation',
        'finance',
        'creditLimitBalance',
        'paymentStatus',
        'orderManagement',
        'warehouse',
        'wh-list',
        'wh-coverage',
        'wh-sku-assignment',
        'wh-stock-management'
      ],
      routing: {
        'account' : ['', 'stores', 'store-segmentation'],
        'finances' : ['*'],
        'orders': ['*'],
        'logistics': ['*']
      },
      toolbar: [],
      redirectTo: '/pages/account/stores'
    },
    {
      role: 'HEAD_OF_SALES',
      navbar: [
        'account',
        'accountsStore',
        'storeSetting',
        'storeSegmentation',
        'catalogue',
        'manageProduct',
        'finance',
        'creditLimitBalance',
        'paymentStatus',
        'orderManagement',
        'inventory',
        'instore',
        'sales-force',
        'sales-rep',
        'portfolio',
        'sr-target',
        'association',
        'journey-plan',
        'workday-setting',
        'warehouse',
        'wh-list',
        'wh-coverage',
        'wh-sku-assignment',
        'wh-stock-management'
      ],
      routing: {
        'account': ['', 'store-segmentation', 'store-setting', 'stores'],
        'catalogues': ['*'],
        'finances': ['*'],
        'orders': ['*'],
        'in-store-inventories': ['*'],
        'sales-force' : ['*'],
        'supplier-inventories' : ['*'],
        'logistics' : ['*'],
        'promos' : ['*']
      },
      toolbar: [],
      redirectTo: '/pages/account/stores'
    },
    {
      role: 'BOS',
      navbar: [
        'account',
        'accountsStore',
        'storeSetting',
        'storeSegmentation',
        'catalogue',
        'manageProduct',
        'attendance',
        'finance',
        'creditLimitBalance',
        'paymentStatus',
        'orderManagement',
        'inventory',
        'instore',
        'sales-force',
        'sales-rep',
        'portfolio',
        'sr-target',
        'association',
        'journey-plan',
        'workday-setting',
        'warehouse',
        'wh-list',
        'wh-coverage',
        'wh-sku-assignment',
        'wh-stock-management'
      ],
      routing: {
        'account' : ['', 'store-segmentation', 'store-setting', 'stores'],
        'attendances' : ['*'],
        'finances' : ['*'],
        'orders' : ['*'],
        'catalogues' : ['*'],
        'in-store-inventories' : ['*'],
        'sales-force' : ['*'],
        'supplier-inventories' : ['*'],
        'logistics' : ['*'],
        'promos' : ['*']
      },
      toolbar: [],
      redirectTo: '/pages/account/stores'
    },
    {
      role: 'COUNTRY_MANAGER',
      routing: {
        'account' : ['', 'store-segmentation', 'store-setting', 'stores'],
        'attendances' : ['*'],
        'finances' : ['*'],
        'orders' : ['*'],
        'catalogues' : ['*'],
        'in-store-inventories' : ['*'],
        'sales-force' : ['*'],
        'supplier-inventories' : ['*'],
        'logistics' : ['*'],
        'promos' : ['*']
      },
      toolbar: [],
      navbar: [
        'account',
        'accountsStore',
        'storeSetting',
        'storeSegmentation',
        'catalogue',
        'manageProduct',
        'attendance',
        'finance',
        'creditLimitBalance',
        'paymentStatus',
        'orderManagement',
        'inventory',
        'instore',
        'sales-force',
        'sales-rep',
        'portfolio',
        'sr-target',
        'association',
        'journey-plan',
        'workday-setting',
        'warehouse',
        'wh-list',
        'wh-coverage',
        'wh-sku-assignment',
        'wh-stock-management'
      ],
      redirectTo: '/pages/account/stores'
    },
    {
      role: 'SUPPLIER_ADMIN',
      routing: {
        'account' : ['*'],
        'attendances' : ['*'],
        'orders' : ['*'],
        'catalogues' : ['*'],
        'in-store-inventories' : ['*'],
        'sales-force' : ['*'],
        'supplier-inventories' : ['*'],
        'settings' : ['*'],
        'logistics' : ['*'],
        'promos' : ['*'],
        'catalogue-segmentations' : ['*'],
        'survey' : ['*']
      },
      toolbar: ['*'],
      navbar: [
        'dashboard',
        'account',
        'accountsStore',
        'storeSetting',
        'storeSegmentation',
        'catalogue',
        'manageProduct',
        'segmentation',
        'attendance',
        'orderManagement',
        'inventory',
        'instore',
        'sales-force',
        'sales-rep',
        'portfolio',
        'sr-target',
        'association',
        'journey-plan',
        'workday-setting',
        'warehouse',
        'wh-list',
        'wh-coverage',
        'wh-sku-assignment',
        'wh-stock-management',
        'promo',
        'flexi-combo',
        'cross-selling-promo',
        'period-target-promo',
        'voucher',
        'survey',
        'survey-manage',
        'survey-response'
      ],
      redirectTo: '/pages/account/stores'
    },
    {
      role: 'SALES_ADMIN_CABANG',
      routing: {
        'orders' : ['*']
      },
      toolbar: [],
      navbar: [ 'orderManagement' ],
      redirectTo: '/pages/orders'
    }
  ]