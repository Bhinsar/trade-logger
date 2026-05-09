"use server";

import { auth } from "@/src/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "../lib/mongodb";
import { Trade } from "../models/Trade";
import { signOutUser } from "./user";

// Enums and Interfaces
enum SideValue {
  Long = "Long",
  Short = "Short"
}

enum AssetClassValues {
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
  trade_image_url?: string[] | null;
  side: SideValue;
  asset_class: AssetClassValues;
  entry_confidence?: number | null;
  satisfaction_rating?: number | null;
  mistakes_made?: string[] | null;
  lessons_learned?: string[] | null;
}

export async function createTrade(trade: TradeInterface): Promise<TradeInterface | null> {
  const session = await auth();
  
  // Basic Auth Guard
  if (!session?.user?.id) {
    console.error("Unauthorized: No session found");
    signOutUser();
    return null;
  }

  try {
    await connectToDatabase();

    const newTrade = await Trade.create({
      ...trade,
      user_id: session.user.id,
    });

    // 3. Convert Mongoose Document to Plain Object for Server Action serialization
    return JSON.parse(JSON.stringify(newTrade)); 
  } catch (error) {
    console.error("Database Error:", error);
    return null;
  }
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

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  try {
    await connectToDatabase();
    const userId = session.user.id;
    const now = new Date();
    
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date(thirtyDaysAgo);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 30);

    const trades = await Trade.find({ user_id: userId, is_deleted: { $ne: true } }).lean();

    const tradesLast30Days = trades.filter((t: any) => new Date(t.entry_time) >= thirtyDaysAgo);
    const tradesPrev30Days = trades.filter((t: any) => new Date(t.entry_time) >= sixtyDaysAgo && new Date(t.entry_time) < thirtyDaysAgo);
    const tradesThisMonthArr = trades.filter((t: any) => new Date(t.entry_time) >= thisMonthStart);

    const calcStats = (tradeSet: any[]) => {
      let highestPnl = 0;
      let wins = 0;
      let totalWinningPnl = 0;
      let totalLosingPnl = 0;
      let losses = 0;
      let totalConfidence = 0;
      let confidenceCount = 0;

      for (const t of tradeSet) {
        // Handle Decimal128 or number
        const pnl = parseFloat(t.pnl_nominal?.toString() || "0");
        if (pnl > highestPnl) highestPnl = pnl;
        
        if (pnl > 0) {
          wins++;
          totalWinningPnl += pnl;
        } else if (pnl < 0) {
          losses++;
          totalLosingPnl += Math.abs(pnl);
        }

        if (t.entry_confidence) {
          totalConfidence += Number(t.entry_confidence);
          confidenceCount++;
        }
      }

      const winRate = tradeSet.length > 0 ? (wins / tradeSet.length) * 100 : 0;
      const avgWin = wins > 0 ? totalWinningPnl / wins : 0;
      const avgLoss = losses > 0 ? totalLosingPnl / losses : 0;
      const avgRiskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : (avgWin > 0 ? avgWin : 0);
      const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
      
      return { highestPnl, winRate, avgRiskRewardRatio, avgConfidence };
    };

    const currentStats = calcStats(tradesLast30Days);
    const prevStats = calcStats(tradesPrev30Days);

    const highestPnlChange = prevStats.highestPnl > 0 ? ((currentStats.highestPnl - prevStats.highestPnl) / prevStats.highestPnl) * 100 : null;
    const winRateChange = prevStats.winRate > 0 ? currentStats.winRate - prevStats.winRate : null;
    const avgRiskRewardChange = prevStats.avgRiskRewardRatio > 0 ? ((currentStats.avgRiskRewardRatio - prevStats.avgRiskRewardRatio) / prevStats.avgRiskRewardRatio) * 100 : null;
    
    const tradesThisMonth = tradesThisMonthArr.length;
    const tradesPrevMonthArr = trades.filter((t: any) => {
      const d = new Date(t.entry_time);
      return d.getMonth() === (now.getMonth() === 0 ? 11 : now.getMonth() - 1) && 
             d.getFullYear() === (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
    });
    const tradesThisMonthChange = tradesThisMonth - tradesPrevMonthArr.length;

    return {
      highestPnl: currentStats.highestPnl,
      winRate: currentStats.winRate,
      avgRiskReward: currentStats.avgRiskRewardRatio > 0 ? `1:${currentStats.avgRiskRewardRatio.toFixed(2)}` : "0:0",
      tradesThisMonth: tradesThisMonth,
      highestPnlChange,
      winRateChange,
      avgRiskRewardChange: avgRiskRewardChange !== 0 ? avgRiskRewardChange : null,
      tradesThisMonthChange,
      avgConfidence: currentStats.avgConfidence,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
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
  sort: string;
  search: string;
  entry_time: Date;
  exit_time: Date;
  asset_class: string;
  limit: number;
  profit: boolean;
  loss: boolean;
}


export async function getTrades({
  page, 
  sort, 
  search, 
  entry_time, 
  exit_time, 
  asset_class, 
  limit, 
  profit, 
  loss
}: getTradesParams): Promise<getTradeResponse[]> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return [];
  }

  try {
    await connectToDatabase();

    // 1. Build Query Object
    const query: any = {
      user_id: session.user.id,
      is_deleted: { $ne: true },
    };

    // Handle Profit/Loss filtering logic
    if (profit && !loss) {
      query.pnl_nominal = { $gt: 0 };
    } else if (loss && !profit) {
      query.pnl_nominal = { $lt: 0 };
    }
    // If both are true or both are false, we show all (no filter applied)

    if (search) {
      query.symbol = { $regex: search, $options: "i" };
    }

    if (entry_time && exit_time) {
      query.entry_time = { $gte: entry_time, $lte: exit_time };
    } else if (entry_time) {
      query.entry_time = { $gte: entry_time };
    } else if (exit_time) {
      // Assuming you want to filter entry_time by the exit deadline if exit_time is provided
      query.entry_time = { $lte: exit_time };
    }

    if (asset_class) {
      query.asset_class = asset_class;
    }

    // 2. Execute Query
    const trades = await Trade.find(query)
      .sort(sort ? { [sort.split(':')[0]]: sort.split(':')[1] === 'desc' ? -1 : 1 } : { entry_time: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // 3. Map Results
    return trades.map((t: any) => ({
      id: t._id.toString(),
      symbol: t.symbol,
      pnl_nominal: parseFloat(t.pnl_nominal?.toString() || "0"),
      entry_time: t.entry_time,
      side: t.side,
    }));

  } catch (error) {
    console.error("Error fetching dashboard trades:", error);
    return [];
  }
}

export interface GraphTradeResponse {
  id: string;
  symbol: string;
  pnl_nominal: number;
  exit_time: Date;
  side: string;
}

export async function getGraphTrades(filter: 'D' | 'W' | 'M' | 'All' = 'M'): Promise<GraphTradeResponse[]> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return [];
  }

  try {
    await connectToDatabase();
    
    const query: any = {
      user_id: session.user.id,
      is_deleted: { $ne: true }
    };

    const now = new Date();
    if (filter === 'D') {
      query.exit_time = { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1) };
    } else if (filter === 'W') {
      const lastWeek = new Date();
      lastWeek.setDate(now.getDate() - 7);
      query.exit_time = { $gte: lastWeek };
    } else if (filter === 'M') {
      const lastMonth = new Date();
      lastMonth.setMonth(now.getMonth() - 1);
      query.exit_time = { $gte: lastMonth };
    }

    const trades = await Trade.find(query)
      .sort({ exit_time: 1 }) // oldest to newest
      .lean();

    return trades.map((t: any) => ({
      id: t._id.toString(),
      symbol: t.symbol,
      pnl_nominal: parseFloat(t.pnl_nominal?.toString() || "0"),
      exit_time: t.exit_time,
      side: t.side,
    }));
  } catch (error) {
    console.error("Error fetching graph trades:", error);
    return [];
  }
}