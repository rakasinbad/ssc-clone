import * as fromOrder from './order.reducer';
import * as fromImportProducts from './import-products.reducer';
import * as fromImportProductsProgress from './import-products-progress.reducer';
import * as fromAvailableSupplierStore from './available-supplier-store.reducer';
import * as fromDataAvailableSupplierStore from './data-available-supplier-store.reducer';
import * as fromProductList from './product-list.reducer';
import * as fromAddProduct from './add-product.reducer';
import * as fromOrderCheckout from './order-checkout.reducer'
import * as fromPaymentOption from './payment-options.reducer';
import * as fromConfirmOrderPayment from './confirm-order-payment.reducer';
import * as fromCancelOrderReason from './cancel-order-reason.reducer';

export { 
    fromOrder,
    fromAvailableSupplierStore,
    fromDataAvailableSupplierStore,
    fromProductList,
    fromAddProduct,
    fromImportProducts,
    fromImportProductsProgress,
    fromOrderCheckout, 
    fromPaymentOption,
    fromConfirmOrderPayment,
    fromCancelOrderReason
};
