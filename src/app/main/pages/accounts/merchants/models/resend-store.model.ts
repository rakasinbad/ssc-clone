type ResendStoreResultMessage =
    | string
    | {
          message: string;
          supplierStoreCode: string;
      };

interface ResendStoreResult {
    readonly id: NonNullable<string>;
    errors?: {
        message: string;
    };
    message: ResendStoreResultMessage;
    status: number;
    storeCode: string;
    storeId: string;
}

type ResendStoreStatus = 'error' | 'success' | 'warning';

export interface ResendStore {
    message: string;
    result: ResendStoreResult[];
    status: ResendStoreStatus;
}
