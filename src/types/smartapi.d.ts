declare module 'smartapi-javascript' {
    export class SmartAPI {
        constructor(config: { api_key: string });
        generateSession(client_id: string, pin: string, totp: string): Promise<any>;
        generateToken(refresh_token: string): Promise<any>;
        setAccessToken(token: string): void;
        setPublicToken(token: string): void;
        setClientCode(code: string): void;
        getProfile(): Promise<any>;
        logout(client_code: string): Promise<any>;

        // Market data — actual method name in the library is marketData (no "get" prefix)
        marketData(params: {
            mode: "LTP" | "OHLC" | "FULL";
            exchangeTokens: Record<string, string[]>;
        }): Promise<any>;

        searchScrip(params: { exchange: string; searchscrip: string }): Promise<any>;
        getCandleData(params: any): Promise<any>;

        // Order methods
        placeOrder(params: any): Promise<any>;
        modifyOrder(params: any): Promise<any>;
        cancelOrder(params: any): Promise<any>;
        getOrderBook(): Promise<any>;
        getTradeBook(): Promise<any>;

        // Portfolio
        getHolding(): Promise<any>;
        getPosition(): Promise<any>;
        getRMS(): Promise<any>;
    }

    export class WebSocket {
        constructor(config: any);
        connect(): Promise<any>;
    }
}
