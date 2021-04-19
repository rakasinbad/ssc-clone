export interface OrderFilterDTO {
    orderDateMin:Date
    orderDateMax:Date
    orderValueMin:number
    orderValueMax:number
    warehouse:string
    orderStatus:string
    paymentStatus:string[]
}
