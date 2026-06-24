export interface ServerConfig {
    hederaNetwork: string;
    facilitatorUrl: string;
    payToAccount: string;
    dataProvider: string;
    port: number;
}

const required = (name: string): string => {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required env var: ${name}`);
    return value;
};

export const loadConfig = (): ServerConfig => ({
    hederaNetwork: required("HEDERA_NETWORK"),
    facilitatorUrl: required("FACILITATOR_URL"),
    payToAccount: required("PAY_TO_ACCOUNT"),
    dataProvider: process.env.DATA_PROVIDER ?? "mock",
    port: Number(process.env.PORT ?? "4021"),
});
