export class ImportProducts {
  file: File
  orderDate: string
  storeId: string
  storeChannelId: string
  storeClusterId: string
  storeGroupId: string
  storeTypeId: string
}

export class IErrorData {
  errCode: string
  solve: string
}

export class IErrorImportProducts {
  name: string
  message: string
  code: number
  className: string
  data?: IErrorData
  errors: any
}