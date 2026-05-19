export enum SideValue {
  Long = "Long",
  Short = "Short"
}

export enum AssetClassValues {
  Equity = "Equity",
  Crypto = "Crypto",
  Forex = "Forex",
  Options = "Options"
}

export interface TradeInterface {
  id?: string | null;
  user_id?: string | null;
  symbol: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  pnl_nominal: number;
  pnl_percentage: number;
  entry_time: Date;
  exit_time: Date;
  strategy_id: string;
  notes?: string | null;
  trade_doc_url?: string[] | null;
  side: SideValue;
  asset_class: AssetClassValues;
  entry_confidence?: number | null;
  satisfaction_rating?: number | null;
  mistakes_made?: string[] | null;
  lessons_learned?: string[] | null;
}

export interface DashboardStats {
  highestPnl: number;
  winRate: number;
  avgRiskReward: string;
  tradesThisMonth: number;
  highestPnlChange: number | null;
  winRateChange: number | null;
  avgRiskRewardChange: number | null;
  tradesThisMonthChange: number | null;
  avgConfidence: number;
}

export interface getTradeResponse {
  id: string;
  symbol: string;
  pnl_nominal: number;
  entry_time: Date;
  side: string;
}

export interface getTradesParams {
  page: number;
  sort?: string;
  search?: string;
  entry_time?: Date;
  exit_time?: Date;
  asset_class?: string;
  limit: number;
  profit?: boolean;
  loss?: boolean;
}

export interface GraphTradeResponse {
  id: string;
  symbol: string;
  pnl_nominal: number;
  exit_time: Date;
  side: string;
}

export interface SymbolStat {
  symbol: string;
  trades: number;
  wins: number;
  winRate: number;
}

export interface InsightStats {
  currentStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
  avgLoss: number;
  biggestLoss: number;
  avgHoldMinutes: number;
  topSymbols: SymbolStat[];
  profitFactor: number;
}

export interface TradeDocument {
  _id: { toString(): string };
  user_id: string;
  symbol: string;
  pnl_nominal?: { toString(): string } | number | string;
  entry_time: Date | string;
  exit_time: Date | string;
  entry_confidence?: number;
  side: string;
  asset_class: string;
}

export interface TradeQuery {
  user_id: string;
  is_deleted: { $ne: boolean };
  pnl_nominal?: { $gt: number } | { $lt: number };
  symbol?: { $regex: string; $options: string };
  entry_time?: { $gte: Date; $lte: Date } | { $gte: Date } | { $lte: Date };
  asset_class?: string;
  exit_time?: { $gte: Date };
}
