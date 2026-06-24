import type { DataProduct } from "./provider.js";

export interface ValidationError {
    status: 404 | 400;
    message: string;
}

export const findProduct = (
    catalog: DataProduct[],
    productId: string,
): DataProduct | undefined => catalog.find((p) => p.id === productId);

export const validateRequest = (
    catalog: DataProduct[],
    productId: string,
    params: Record<string, string>,
): ValidationError | null => {
    const product = findProduct(catalog, productId);
    if (!product)
        return { status: 404, message: `Unknown product: ${productId}` };
    for (const [name, schema] of Object.entries(product.paramsSchema)) {
        if (schema.required && !params[name])
            return { status: 400, message: `Missing required param: ${name}` };
    }
    return null;
};

export const productIdFromPath = (path: string): string => {
    const segments = path.split("/").filter(Boolean);
    return segments[segments.length - 1] ?? "";
};

export const priceForProduct = (
    catalog: DataProduct[],
    productId: string,
): { amount: string; asset: string } => {
    const product = findProduct(catalog, productId);
    if (!product) throw new Error(`Unknown product for pricing: ${productId}`);
    return { amount: product.priceAtomic, asset: product.asset };
};
