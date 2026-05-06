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