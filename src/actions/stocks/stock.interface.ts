export interface StockSearchResultItem {
    label: string;
    value: string;
}

export interface SmartAPISearchItem {
    tradingsymbol: string;
    symboltoken: string;
}

export interface StockMarketDataItem {
    symbol: string;
    ltp: number;
    token: string;
    percentChange: number;
}

export interface SmartAPIMarketDataItem {
    tradingSymbol?: string;
    tradingsymbol?: string;
    ltp: number;
    symbolToken?: string;
    symboltoken?: string;
    percentChange?: number;
    netChange?: number;
}
