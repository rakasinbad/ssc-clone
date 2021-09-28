interface Routing {
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
  'promos'? : ('' | 'flexi-combo' | 'voucher' | 'cross-selling-promo' | 'promo-hierarchy' | '*')[],
  'catalogue-segmentations'? : ('' | 'add' | 'edit' | 'detail' | '*')[],
  'survey'? : ('' | 'response' | 'manage' | '*')[],
  'skp'? : ('' | 'list' | 'detail' | '*')[]

}

type Navbar = (
  '*' | 'dashboard' | 'account' | 'accountsStore' | 'storeSetting' | 
  'storeSegmentation' | 'catalogue' | 'manageProduct' | 'segmentation' | 
  'attendance' | 'finance' | 'creditLimitBalance' | 'paymentStatus' |
  'orderManagement' | 'returnManagement' | 'inventory' | 'instore' | 'sales-force' |
  'sales-rep' | 'portfolio' | 'sr-target' | 'association' |
  'journey-plan' | 'workday-setting' | 'warehouse' | 'wh-list' |
  'wh-coverage' | 'wh-sku-assignment' | 'wh-stock-management' |
  'promo' | 'flexi-combo'| 'cross-selling-promo' | 'period-target-promo' |
  'voucher' | 'promo-hierarchy' | 'survey' | 'survey-manage' | 'survey-response' | 'skp'
)[];

type Toolbar = ('Supplier Information' | 'Account Settings' | 'Internal' | '*')[]

export interface Rule {
    role : string,
    routing : Routing,
    navbar : Navbar,
    toolbar : Toolbar,
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
      role: 'SUPER_ADMIN',
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
        'returnManagement',
        'warehouse',
        'wh-list',
        'wh-coverage',
        'wh-stock-management'
      ],
      routing: {
        'account' : ['', 'stores', 'store-segmentation'],
        'finances' : ['*'],
        'orders': ['*'],
        'logistics': ['stock-managements', 'warehouse-coverages', 'warehouses']
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
        'returnManagement',
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
        'logistics': ['', 'stock-managements', 'warehouse-coverages', 'warehouses'],
        'promos' : ['','voucher']
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
        'returnManagement',
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
        'logistics': ['', 'stock-managements', 'warehouse-coverages', 'warehouses'],
        'promos' : ['', 'voucher']
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
        'logistics': ['', 'stock-managements', 'warehouse-coverages', 'warehouses'],
        'promos' : ['','voucher']
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
        'returnManagement',
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
        'finances' : ['*'],
        'sales-force' : ['*'],
        'supplier-inventories' : ['*'],
        'settings' : ['*'],
        'logistics': ['', 'stock-managements', 'warehouse-coverages', 'warehouses'],
        'promos' : ['','voucher', 'promo-hierarchy'],
        'catalogue-segmentations' : ['*'],
        'survey' : ['*'],
        'skp': ['*']
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
        'finance',
        'creditLimitBalance',
        'paymentStatus',
        'orderManagement',
        'returnManagement',
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
        'wh-stock-management',
        'promo',
        'voucher',
        'promo-hierarchy',
        'survey',
        'survey-manage',
        'survey-response',
        'skp'
      ],
      redirectTo: '/pages/account/stores'
    },
    {
      role: 'SALES_ADMIN_CABANG',
      routing: {
        'orders' : ['*']
      },
      toolbar: [],
      navbar: [ 'orderManagement', 'returnManagement' ],
      redirectTo: '/pages/orders'
    }
  ]

  const rolese = [
    {
      privilages : 'ACCOUNT.STORE.CREATE',
      route: '',
    },
    {
      privilages : 'ACCOUNT.STORE.READ',
      route: '',
    },
    {
      privilages : 'ACCOUNT.STORE.UPDATE',
      route: '',
    },
    {
      privilages : 'ACCOUNT.STORE.DELETE',
      route: '',
    },
    {
      privilages : 'ACCOUNT.STORE.EXPORT',
      route: '',
    },
    {
      privilages : 'ACCOUNT.STORE.IMPORT',
      route: '',
    },
    {
      privilages : 'ACCOUNT.STORE.DOWNLOAD_TEMPLATE',
      route: '',
    },
    {
      privilages : 'account.STORE.EMPLOYEE.CREATE',
      route: '',
    },
    {
      privilages : 'account.STORE.EMPLOYEE.READ',
      route: '',
    },
    {
      privilages : 'account.STORE.EMPLOYEE.UPDATE',
      route: '',
    },
    {
      privilages : 'account.STORE.EMPLOYEE.DELETE',
      route: '',
    },
    {
      privilages : 'account.STORE.EMPLOYEE.EXPORT',
      route: '',
    },
    {
      privilages : 'account.STORE.EMPLOYEE.IMPORT',
      route: '',
    },
    {
      privilages : 'account.STORE.EMPLOYEE.DOWNLOAD_TEMPLATE',
      route: '',
    },
    {
      privilages : 'ACCOUNT.INTERNAL.CREATE',
      route: '',
    },
    {
      privilages : 'ACCOUNT.INTERNAL.READ',
      route: '',
    },
    {
      privilages : 'ACCOUNT.INTERNAL.UPDATE',
      route: '',
    },
    {
      privilages : 'ACCOUNT.INTERNAL.DELETE',
      route: '',
    },
    {
      privilages : 'ACCOUNT.INTERNAL.EXPORT',
      route: '',
    },
    {
      privilages : 'ACCOUNT.INTERNAL.IMPORT',
      route: '',
    },
    {
      privilages : 'ACCOUNT.INTERNAL.DOWNLOAD_TEMPLATE',
      route: '',
    },
    {
      privilages : 'CATALOGUE.CREATE',
      route: '',
    },
    {
      privilages : 'CATALOGUE.READ',
      route: '',
    },
    {
      privilages : 'CATALOGUE.UPDATE',
      route: '',
    },
    {
      privilages : 'CATALOGUE.DELETE',
      route: '',
    },
    {
      privilages : 'CATALOGUE.EXPORT',
      route: '',
    },
    {
      privilages : 'CATALOGUE.IMPORT',
      route: '',
    },
    {
      privilages : 'CATALOGUE.DOWNLOAD_TEMPLATE',
      route: '',
    },
    {
      privilages : 'ATTENDANCE.CREATE',
      route: '',
    },
    {
      privilages : 'ATTENDANCE.READ',
      route: '',
    },
    {
      privilages : 'ATTENDANCE.UPDATE',
      route: '',
    },
    {
      privilages : 'ATTENDANCE.DELETE',
      route: '',
    },
    {
      privilages : 'ATTENDANCE.EXPORT',
      route: '',
    },
    {
      privilages : 'ATTENDANCE.IMPORT',
      route: '',
    },
    {
      privilages : 'ATTENDANCE.DOWNLOAD_TEMPLATE',
      route: '',
    },
    {
      privilages : 'finance.CLB.SL.CREATE',
      route: '',
    },
    {
      privilages : 'finance.CLB.SL.READ',
      route: '',
    },
    {
      privilages : 'finance.CLB.SL.UPDATE',
      route: '',
    },
    {
      privilages : 'finance.CLB.SL.DELETE',
      route: '',
    },
    {
      privilages : 'finance.CLB.SL.IMPORT',
      route: '',
    },
    {
      privilages : 'finance.CLB.SL.EXPORT',
      route: '',
    },
    {
      privilages : 'finance.CLB.SL.DOWNLOAD_TEMPLATE',
      route: '',
    },
    {
      privilages : 'finance.CLB.CLG.CREATE',
      route: '',
    },
    {
      privilages : 'finance.CLB.CLG.READ',
      route: '',
    },
    {
      privilages : 'finance.CLB.CLG.UPDATE',
      route: '',
    },
    {
      privilages : 'finance.CLB.CLG.DELETE',
      route: '',
    },
    {
      privilages : 'finance.CLB.CLG.IMPORT',
      route: '',
    },
    {
      privilages : 'finance.CLB.CLG.EXPORT',
      route: '',
    },
    {
      privilages : 'finance.CLB.CLG.DOWNLOAD_TEMPLATE',
      route: '',
    },
    {
      privilages : 'FINANCE.PS.CREATE',
      route: '',
    },
    {
      privilages : 'FINANCE.PS.READ',
      route: '',
    },
    {
      privilages : 'FINANCE.PS.UPDATE',
      route: '',
    },
    {
      privilages : 'FINANCE.PS.DELETE',
      route: '',
    },
    {
      privilages : 'FINANCE.PS.EXPORT',
      route: '',
    },
    {
      privilages : 'FINANCE.PS.IMPORT',
      route: '',
    },
    {
      privilages : 'FINANCE.PS.DOWNLOAD_TEMPLATE',
      route: '',
    },
    {
      privilages : 'OMS.CREATE',
      route: '',
    },
    {
      privilages : 'OMS.READ',
      route: '',
    },
    {
      privilages : 'OMS.UPDATE',
      route: '',
    },
    {
      privilages : 'OMS.DELETE',
      route: '',
    },
    {
      privilages : 'RETURN.READ',
      route: '',
    },
    {
      privilages : 'OMS.EXPORT',
      route: '',
    },
    {
      privilages : 'OMS.IMPORT',
      route: '',
    },
    {
      privilages : 'OMS.DOWNLOAD_TEMPLATE',
      route: '',
    },
    {
      privilages : 'INVENTORY.SI.CREATE',
      route: '',
    },
    {
      privilages : 'INVENTORY.SI.READ',
      route: '',
    },
    {
      privilages : 'INVENTORY.SI.UPDATE',
      route: '',
    },
    {
      privilages : 'INVENTORY.SI.DELETE',
      route: '',
    },
    {
      privilages : 'INVENTORY.SI.EXPORT',
      route: '',
    },
    {
      privilages : 'INVENTORY.SI.IMPORT',
      route: '',
    },
    {
      privilages : 'INVENTORY.SI.DOWNLOAD_TEMPLATE',
      route: '',
    },
    {
      privilages : 'INVENTORY.ISI.CREATE',
      route: '',
    },
    {
      privilages : 'INVENTORY.ISI.READ',
      route: '',
    },
    {
      privilages : 'INVENTORY.ISI.UPDATE',
      route: '',
    },
    {
      privilages : 'SRM.SR.CREATE',
      route: '',
    },
    {
      privilages : 'SRM.SR.READ',
      route: '',
    },
    {
      privilages : 'SRM.SR.UPDATE',
      route: '',
    },
    {
      privilages : 'SRM.SR.DELETE',
      route: '',
    },
    {
      privilages : 'SRM.SR.EXPORT',
      route: '',
    },
    {
      privilages : 'SRM.SR.IMPORT',
      route: '',
    },
    {
      privilages : 'SRM.SR.DOWNLOAD_TEMPLATE',
      route: '',
    },
    {
      privilages : 'SRM.PFO.CREATE',
      route: '',
    },
    {
      privilages : 'SRM.PFO.READ',
      route: '',
    },
    {
      privilages : 'SRM.PFO.UPDATE',
      route: '',
    },
    {
      privilages : 'SRM.PFO.DELETE',
      route: '',
    },
    {
      privilages : 'SRM.PFO.EXPORT',
      route: '',
    },
    {
      privilages : 'SRM.PFO.IMPORT',
      route: '',
    },
    {
      privilages : 'SRM.PFO.DOWNLOAD_TEMPLATE',
      route: '',
    },
    {
      privilages : 'SRM.ASC.CREATE',
      route: '',
    },
    {
      privilages : 'SRM.ASC.READ',
      route: '',
    },
    {
      privilages : 'SRM.ASC.UPDATE',
      route: '',
    },
    {
      privilages : 'SRM.ASC.DELETE',
      route: '',
    },
    {
      privilages : 'SRM.ASC.EXPORT',
      route: '',
    },
    {
      privilages : 'SRM.ASC.IMPORT',
      route: '',
    },
    {
      privilages : 'SRM.ASC.DOWNLOAD_TEMPLATE',
      route: '',
    },
    {
      privilages : 'SRM.JP.CREATE',
      route: '',
    },
    {
      privilages : 'SRM.JP.READ',
      route: '',
    },
    {
      privilages : 'SRM.JP.UPDATE',
      route: '',
    },
    {
      privilages : 'SRM.JP.DELETE',
      route: '',
    },
    {
      privilages : 'SRM.JP.EXPORT',
      route: '',
    },
    {
      privilages : 'SRM.JP.IMPORT',
      route: '',
    },
    {
      privilages : 'SRM.JP.DOWNLOAD_TEMPLATE',
      route: '',
    },
    {
      privilages : 'WH.L.CREATE',
      route: '',
    },
    {
      privilages : 'WH.L.READ',
      route: '',
    },
    {
      privilages : 'WH.L.UPDATE',
      route: '',
    },
    {
      privilages : 'WH.L.EXPORT',
      route: '',
    },
    {
      privilages : 'WH.C.CREATE',
      route: '',
    },
    {
      privilages : 'WH.C.READ',
      route: '',
    },
    {
      privilages : 'WH.C.UPDATE',
      route: '',
    },
    {
      privilages : 'WH.SKU.CREATE',
      route: '',
    },
    {
      privilages : 'WH.SKU.READ',
      route: '',
    },
    {
      privilages : 'WH.SKU.UPDATE',
      route: '',
    },
    {
      privilages : 'WH.SM.CREATE',
      route: '',
    },
    {
      privilages : 'WH.SM.READ',
      route: '',
    },
    {
      privilages : 'WH.SM.UPDATE',
      route: '',
    },
    {
      privilages : 'PRM.FC.CREATE',
      route: '',
    },
    {
      privilages : 'PRM.FC.READ',
      route: '',
    },
    {
      privilages : 'PRM.FC.DELETE',
      route: '',
    },
    {
      privilages : 'PRM.CSP.CREATE',
      route: '',
    },
    {
      privilages : 'PRM.CSP.READ',
      route: '',
    },
    {
      privilages : 'PRM.CSP.DELETE',
      route: '',
    },
    {
      privilages : 'PRM.SV.CREATE',
      route: '',
    },
    {
      privilages : 'PRM.SV.READ',
      route: '',
    },
    {
      privilages : 'PRM.SV.DELETE',
      route: '',
    },
    {
      privilages : 'PRM.PH.READ',
      route: '',
    },
    {
      privilages : 'PRM.PH.UPDATE',
      route: '',
    },
    {
      privilages : 'SS.CREATE',
      route: '',
    },
    {
      privilages : 'SS.READ',
      route: '',
    },
    {
      privilages : 'SS.UPDATE',
      route: '',
    },
    {
      privilages : 'SKP.CREATE',
      route: '',
    },
    {
      privilages : 'SKP.READ',
      route: '',
    },
    {
      privilages : 'SKP.UPDATE',
      route: '',
    },
  ]