"use server";
import { SmartAPI } from "smartapi-javascript";
import speakeasy from "speakeasy";
import { StockSearchResultItem, SmartAPISearchItem, StockMarketDataItem, SmartAPIMarketDataItem } from "./stock.interface";

// ── Shared helper: creates an authenticated SmartAPI session ──────────────────
async function getSmartAPISession() {
    const smart_api = new SmartAPI({ api_key: process.env.ANGEL_API_KEY! });
    const totp = speakeasy.totp({
        secret: process.env.ANGEL_TOTP_SECRET!,
        encoding: "base32",
    });
    await smart_api.generateSession(
        process.env.ANGEL_CLIENT_ID!,
        process.env.ANGEL_PIN!,
        totp
    );
    return smart_api;
}

// ── Search for valid stock symbols/names ─────────────────────────────────────
export async function searchStocks(
    query: string,
    exchange: "NSE" | "BSE" | "NFO" | "MCX" = "NSE"
): Promise<StockSearchResultItem[]> {
    if (!query || query.trim().length < 1) return [];
    try {
        const smart_api = await getSmartAPISession();
        const result = await smart_api.searchScrip({
            exchange,
            searchscrip: query.trim().toUpperCase(),
        });
        const data: SmartAPISearchItem[] = Array.isArray(result) ? result as SmartAPISearchItem[] : [];
        return data.slice(0, 15).map((item: SmartAPISearchItem) => ({
            label: `${item.tradingsymbol} — ${item.symboltoken}`,
            value: item.tradingsymbol,
        }));
    } catch (error) {
        console.error("Stock search error:", error);
        return [];
    }
}

export async function fetchNiftyTop10(): Promise<StockMarketDataItem[]> {
    try {
        const smart_api = await getSmartAPISession();

        // Nifty Top 10 symbol tokens on NSE
        const tokens = ["2885", "1333", "4963", "10604", "3045", "11536", "1594", "5900", "11483", "1660"];

        // mode "FULL" returns ltp + open/high/low/close/netChange/percentChange
        const result = await smart_api.marketData({
            mode: "FULL",
            exchangeTokens: {
                NSE: tokens,
            },
        });
        const responseData = result as { data?: { fetched?: SmartAPIMarketDataItem[] } };
        const fetched: SmartAPIMarketDataItem[] = responseData?.data?.fetched || [];
        return fetched.map((item: SmartAPIMarketDataItem) => ({
            symbol: item.tradingSymbol || item.tradingsymbol || "Unknown",
            ltp: item.ltp,
            token: item.symbolToken || item.symboltoken || "",
            percentChange: item.percentChange ?? item.netChange ?? 0,
        }));
    } catch (error) {
        console.error("Fetch Error:", error);
        return [];
    }
}