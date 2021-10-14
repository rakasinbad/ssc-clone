import { createFeatureSelector, createSelector } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { OrderLineType } from 'app/shared/models/order-line-type.model';
import { flatten, map } from 'lodash';
import { fromOrder } from '../reducers';

export const getOrderState = createFeatureSelector<fromOrder.State>(fromOrder.FEATURE_KEY);

export const getAllOrder = createSelector(getOrderState, fromOrder.selectAllOrder);

export const getOrderEntities = createSelector(getOrderState, fromOrder.selectOrderEntities);

export const getTotalOrderEntity = createSelector(getOrderState, fromOrder.selectOrderTotal);

export const getTotalOrder = createSelector(getOrderState, (state) => state.orders.total);

export const getSelectedOrderId = createSelector(
    getOrderState,
    (state) => state.orders.selectedOrderId
);

export const getSelectedOrder = createSelector(
    getOrderEntities,
    getSelectedOrderId,
    (entities, id) => entities[id]
);

export const getTotalStatus = createSelector(getOrderState, (state) => state.orders.totalStatus);

export const getTotalAllOrder = createSelector(getTotalStatus, (state) => state.totalOrder);

export const getTotalPendingPayment = createSelector(
    getTotalStatus,
    (state) => state.totalPendingPaymentOrder
);

export const getTotalPendingPartialOrder = createSelector(
    getTotalStatus,
    (state) => state.totalPendingPartialOrder
);

export const getTotalNewOrder = createSelector(getTotalStatus, (state) => state.totalNewOrder);

export const getTotalPackedOrder = createSelector(
    getTotalStatus,
    (state) => state.totalPackedOrder
);

export const getTotalShippedOrder = createSelector(
    getTotalStatus,
    (state) => state.totalShippedOrder
);

export const getTotalDeliveredOrder = createSelector(
    getTotalStatus,
    (state) => state.totalDeliveredOrder
);

export const getTotalCompletedOrder = createSelector(
    getTotalStatus,
    (state) => state.totalCompletedOrder
);

export const getTotalPendingOrder = createSelector(
    getTotalStatus,
    (state) => state.totalPendingOrder
);

export const getTotalCanceledOrder = createSelector(
    getTotalStatus,
    (state) => state.totalCanceledOrder
);

export const getOrderBrandCatalogue = (type: OrderLineType) =>
    createSelector(getSelectedOrder, (state) => {
        if (type === 'non_bonus') {
            if (state && state.orderBrands && state.orderBrands.length > 0) {
                return (
                    flatten(map(state.orderBrands, 'orderBrandCatalogues')).filter(
                        (item) => item.type === type
                    ) || []
                );
            }
        } else if (type === 'bonus') {
            if (state && state.promoList && state.promoList.length > 0) {
                return (
                    state.promoList.map((v) => ({
                        id: v.promoOrderBrandCatalogueId,
                        catalogue: {
                            id: v.promoOrderBrandCatalogueId,
                            name: v.catalogueName,
                            externalId: v.catalogueExternalId,
                        },
                        cataloguePromo: 0,
                        deliveredCataloguePromo: 0,
                        invoicedCataloguePromo: 0,
                        grossPrice: 0,
                        deliveredGrossPrice: 0,
                        invoicedGrossPrice: 0,
                        qty: v.originalPromoQty,
                        invoicedQty: v.invoicedPromoQty || 0,
                        deliveredQty: v.deliveredPromoQty || 0,
                        type,
                    })) || []
                );
            }
        }

        return [];
    });

export const getIsRefresh = createSelector(getOrderState, (state) => state.isRefresh);

export const getIsLoading = createSelector(getOrderState, (state) => state.isLoading);

export const getEditCondition = createSelector(getOrderState, (state) => state.isEdit);

