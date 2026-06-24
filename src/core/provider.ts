export interface ParamsSchema {
    [param: string]: { type: "string"; required: boolean };
}

export interface DataProduct {
    id: string;
    description: string;
    asset: string;
    priceAtomic: string;
    paramsSchema: ParamsSchema;
    freshnessWindowSec?: number;
}

export interface DataResult {
    data: unknown;
    asOf: string;
    providerId: string;
    attestable?: boolean;
}

export interface DataProvider {
    readonly id: string;
    catalog(): DataProduct[];
    fetch(
        productId: string,
        params: Record<string, string>,
    ): Promise<DataResult>;
}
