export class IImportResult {
  catalogueId: number
  skuSupplier: string
  productName: string
  UOM: string
  price: number
  discountPrice: number
  tax: number
  taxType: string
  advancePrice: number
  minQty: number
  minQtyType: string
  multipleQty: number
  multipleQtyType: string
  orderQty: number
  packageQty: number
  maxQty: number
  errorQty?: string
}
export class IImportProductsProgress {
  progress: number
  status: "progress" | "success" | "failed"
  results: IImportResult[]
  error?: string
}