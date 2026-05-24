"use server";

import { auth } from "../../app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "../../lib/mongodb";
import { Trade } from "../../models/Trade";

export interface TradingReview {
  performanceOverview: string;
  strengths: string[];
  weaknesses: string[];
  mistakesAnalysis: string;
  actionableAdvice: string[];
}

export async function generateAiSummary(startDateStr: string, endDateStr: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await connectToDatabase();
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);

    const trades = await Trade.find({
      user_id: session.user.id,
      is_deleted: { $ne: true },
      entry_time: { $gte: start, $lte: end }
    }).sort({ entry_time: 1 }).lean();

    if (!trades || trades.length === 0) {
      return { success: false, error: "No trades found in the selected date range." };
    }

    const total_trades = trades.length;
    const wins = trades.filter(t => parseFloat(t.pnl_nominal?.toString() || '0') > 0).length;
    const win_rate = total_trades > 0 ? Math.round((wins / total_trades) * 100) : 0;
    const total_pnl = trades.reduce((sum, t) => sum + parseFloat(t.pnl_nominal?.toString() || '0'), 0);
    
    let gross_profit = 0;
    let gross_loss = 0;
    for (const t of trades) {
      const p = parseFloat(t.pnl_nominal?.toString() || '0');
      if (p > 0) gross_profit += p;
      else if (p < 0) gross_loss += Math.abs(p);
    }
    const profit_factor = gross_loss > 0 ? parseFloat((gross_profit / gross_loss).toFixed(2)) : (gross_profit > 0 ? 99.9 : 0);

    const tradeData = trades.map(t => ({
      symbol: t.symbol,
      side: t.side,
      entry_price: parseFloat(t.entry_price?.toString() || '0'),
      exit_price: parseFloat(t.exit_price?.toString() || '0'),
      quantity: parseFloat(t.quantity?.toString() || '0'),
      pnl: parseFloat(t.pnl_nominal?.toString() || '0'),
      pnl_percent: t.pnl_percentage || 0,
      confidence: t.entry_confidence || 'N/A',
      rating: t.satisfaction_rating || 'N/A',
      mistakes: t.mistakes_made || [],
      lessons: t.lessons_learned || [],
      notes: t.notes || ''
    }));

    const prompt = `You are a professional trading coach and performance analyst. 
Analyze the following trading log of ${total_trades} trades spanning from ${startDateStr} to ${endDateStr}. 
Overall stats: PnL is $${total_pnl.toFixed(2)}, Win Rate is ${win_rate}%, Profit Factor is ${profit_factor}.

Trading Log:
${JSON.stringify(tradeData, null, 2)}

Provide a detailed review. Return a JSON object with this EXACT structure (no other text, no wrapper):
{
  "performanceOverview": "A brief summary of performance, highlighting how the trader did, and analyzing key outcomes.",
  "strengths": ["Identify 2-3 key strengths based on winning trades, high confidence ratings, or good notes."],
  "weaknesses": ["Identify 2-3 patterns or mistakes in losing trades, or low satisfaction ratings."],
  "mistakesAnalysis": "Analysis of trade mistakes or behavioral issues (e.g. FOMO, over-trading, bad risk management).",
  "actionableAdvice": ["3 clear, actionable steps for the trader to improve in their next session."]
}
Note: You can write markdown within the text fields (e.g. bold text, bullet points).`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "GEMINI_API_KEY is not defined in the environment." };
    }

    // Call gemini-2.5-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API Error:", err);
      return { success: false, error: "Gemini API returned an error response." };
    }

    const resData = await response.json();
    const contentText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!contentText) {
      return { success: false, error: "Gemini returned an empty response." };
    }

    let parsedSummary: TradingReview;
    try {
      parsedSummary = JSON.parse(contentText);
    } catch {
      return { success: false, error: "Failed to parse AI review output as structured JSON." };
    }

    return {
      success: true,
      summary: parsedSummary,
      stats: {
        total_trades,
        win_rate,
        total_pnl,
        profit_factor
      }
    };
  } catch (error: any) {
    console.error("Generate AI Summary error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
