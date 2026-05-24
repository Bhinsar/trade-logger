"use server";

import { auth } from "@/src/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "../../lib/mongodb";
import { TradeChecklist } from "../../models/TradeChecklist";
import { ChecklistHistory } from "../../models/ChecklistHistory";
import { ChecklistSession } from "../../models/ChecklistSession";
import { signOutUser } from "../users/user";
import { revalidatePath } from "next/cache";
import {
  ChecklistItemInterface,
  ChecklistItemResponse,
  ChecklistDocument,
  ChecklistCategory,
  ChecklistPriority,
  HistoryRecordResponse,
} from "./checklist.interface";

// ─── Get all checklist items for the current user ──────────────────────────

export async function getChecklistItems(): Promise<ChecklistItemResponse[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    await connectToDatabase();

    const items = await TradeChecklist.find({
      user_id: session.user.id,
      is_deleted: { $ne: true },
    })
      .sort({ order: 1, created_at: 1 })
      .lean();

    return (items as unknown as ChecklistDocument[]).map((item) => ({
      id: item._id.toString(),
      title: item.title,
      description: item.description ?? null,
      category: item.category as ChecklistCategory,
      priority: item.priority as ChecklistPriority,
      order: item.order,
      is_active: item.is_active,
      created_at: new Date(item.created_at),
      updated_at: new Date(item.updated_at),
    }));
  } catch (error) {
    console.error("Error fetching checklist items:", error);
    return [];
  }
}

// ─── Create a new checklist item ───────────────────────────────────────────

export async function createChecklistItem(
  item: Omit<ChecklistItemInterface, "id" | "user_id" | "order">
): Promise<ChecklistItemResponse | null> {
  const session = await auth();

  if (!session?.user?.id) {
    signOutUser();
    return null;
  }

  try {
    await connectToDatabase();

    // Get the highest order value to append at end
    const lastItem = await TradeChecklist.findOne({
      user_id: session.user.id,
      is_deleted: { $ne: true },
    })
      .sort({ order: -1 })
      .lean();

    const nextOrder = lastItem
      ? (lastItem as unknown as ChecklistDocument).order + 1
      : 0;

    const newItem = await TradeChecklist.create({
      ...item,
      user_id: session.user.id,
      order: nextOrder,
    });

    revalidatePath("/trades-checklist");

    const plain = JSON.parse(JSON.stringify(newItem));
    return {
      id: plain._id,
      title: plain.title,
      description: plain.description ?? null,
      category: plain.category,
      priority: plain.priority,
      order: plain.order,
      is_active: plain.is_active,
      created_at: new Date(plain.created_at),
      updated_at: new Date(plain.updated_at),
    };
  } catch (error) {
    console.error("Error creating checklist item:", error);
    return null;
  }
}

// ─── Update a checklist item ───────────────────────────────────────────────

export async function updateChecklistItem(
  id: string,
  item: Partial<Omit<ChecklistItemInterface, "id" | "user_id">>
): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  try {
    await connectToDatabase();

    const result = await TradeChecklist.updateOne(
      { _id: id, user_id: session.user.id, is_deleted: { $ne: true } },
      { $set: item }
    );

    revalidatePath("/trades-checklist");
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating checklist item:", error);
    return false;
  }
}

// ─── Toggle active state ───────────────────────────────────────────────────

export async function toggleChecklistItem(
  id: string,
  is_active: boolean
): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  try {
    await connectToDatabase();

    const result = await TradeChecklist.updateOne(
      { _id: id, user_id: session.user.id, is_deleted: { $ne: true } },
      { $set: { is_active } }
    );

    revalidatePath("/trades-checklist");
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error toggling checklist item:", error);
    return false;
  }
}

// ─── Delete (soft) a checklist item ───────────────────────────────────────

export async function deleteChecklistItem(id: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  try {
    await connectToDatabase();

    const result = await TradeChecklist.updateOne(
      { _id: id, user_id: session.user.id },
      { $set: { is_deleted: true, delete_at: new Date() } }
    );

    revalidatePath("/trades-checklist");
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    return false;
  }
}

// ─── Reorder checklist items ───────────────────────────────────────────────

export async function reorderChecklistItems(
  orderedIds: string[]
): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  try {
    await connectToDatabase();

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, user_id: session!.user!.id },
        update: { $set: { order: index } },
      },
    }));

    await TradeChecklist.bulkWrite(bulkOps);

    revalidatePath("/trades-checklist");
    return true;
  } catch (error) {
    console.error("Error reordering checklist items:", error);
    return false;
  }
}

// ─── Sync sessions and archive previous day's checked items ─────────────────

export async function syncSessionsAndArchive(todayStr: string): Promise<{
  completed_ids: string[];
  history: HistoryRecordResponse[];
}> {
  const session = await auth();
  if (!session?.user?.id) return { completed_ids: [], history: [] };

  try {
    await connectToDatabase();
    const userId = session.user.id;

    // 1. Find sessions of previous dates
    const oldSessions = await ChecklistSession.find({
      user_id: userId,
      date_string: { $ne: todayStr },
    }).lean();

    if (oldSessions.length > 0) {
      // Fetch active rules for title matching
      const activeRules = await TradeChecklist.find({
        user_id: userId,
        is_active: true,
        is_deleted: { $ne: true },
      }).lean();

      if (activeRules.length > 0) {
        const activeRulesMap = new Map(activeRules.map((r: any) => [r._id.toString(), r.title]));
        const activeIdsForUser = activeRules.map((r: any) => r._id.toString());

        for (const oldSess of oldSessions) {
          const completedIds = (oldSess.completed_ids || []) as string[];
          const validCompletedIds = completedIds.filter((id) => activeIdsForUser.includes(id));

          if (validCompletedIds.length > 0) {
            const completedTitles = validCompletedIds.map((id) => activeRulesMap.get(id) || "Unknown Rule");
            const percentage = Math.round((validCompletedIds.length / activeRules.length) * 100);
            const parsedDate = new Date(oldSess.date_string);

            await ChecklistHistory.create({
              user_id: userId,
              date: parsedDate,
              total: activeRules.length,
              completed: validCompletedIds.length,
              percentage,
              items: completedTitles,
            });
          }
        }
      }

      // Delete old sessions
      await ChecklistSession.deleteMany({
        user_id: userId,
        date_string: { $ne: todayStr },
      });
    }

    // 2. Get or create today's session
    let todaySession = await ChecklistSession.findOne({
      user_id: userId,
      date_string: todayStr,
    });

    if (!todaySession) {
      todaySession = await ChecklistSession.create({
        user_id: userId,
        date_string: todayStr,
        completed_ids: [],
      });
    }

    // 3. Fetch history
    const historyDocs = await ChecklistHistory.find({ user_id: userId })
      .sort({ date: -1 })
      .lean();

    const historyList: HistoryRecordResponse[] = (historyDocs as any[]).map((doc) => ({
      id: doc._id.toString(),
      date: doc.date,
      total: doc.total,
      completed: doc.completed,
      percentage: doc.percentage,
      items: doc.items,
      created_at: doc.created_at,
    }));

    return {
      completed_ids: JSON.parse(JSON.stringify(todaySession.completed_ids)),
      history: historyList,
    };
  } catch (error) {
    console.error("Error syncing sessions and archiving:", error);
    return { completed_ids: [], history: [] };
  }
}

// ─── Update today's checklist session checkbox states ──────────────────────

export async function updateTodaySession(todayStr: string, completedIds: string[]): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  try {
    await connectToDatabase();
    const userId = session.user.id;

    await ChecklistSession.updateOne(
      { user_id: userId, date_string: todayStr },
      { $set: { completed_ids: completedIds } },
      { upsert: true }
    );

    return true;
  } catch (error) {
    console.error("Error updating today checklist session:", error);
    return false;
  }
}

// ─── Archive manual session ────────────────────────────────────────────────

export async function archiveSessionAction(dateStr: string, completedIds: string[]): Promise<HistoryRecordResponse | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    await connectToDatabase();
    const userId = session.user.id;

    const activeRules = await TradeChecklist.find({
      user_id: userId,
      is_active: true,
      is_deleted: { $ne: true },
    }).lean();

    if (activeRules.length === 0) return null;

    const activeRulesMap = new Map(activeRules.map((r: any) => [r._id.toString(), r.title]));
    const activeIdsForUser = activeRules.map((r: any) => r._id.toString());
    const validCompletedIds = completedIds.filter((id) => activeIdsForUser.includes(id));

    const completedTitles = validCompletedIds.map((id) => activeRulesMap.get(id) || "Unknown Rule");
    const percentage = Math.round((validCompletedIds.length / activeRules.length) * 100);
    const parsedDate = new Date(dateStr);

    const newHistory = await ChecklistHistory.create({
      user_id: userId,
      date: parsedDate,
      total: activeRules.length,
      completed: validCompletedIds.length,
      percentage,
      items: completedTitles,
    });

    // Reset today's session
    await ChecklistSession.updateOne(
      { user_id: userId, date_string: dateStr },
      { $set: { completed_ids: [] } }
    );

    return {
      id: newHistory._id.toString(),
      date: newHistory.date,
      total: newHistory.total,
      completed: newHistory.completed,
      percentage: newHistory.percentage,
      items: newHistory.items,
      created_at: newHistory.created_at,
    };
  } catch (error) {
    console.error("Error archiving checklist session:", error);
    return null;
  }
}

// ─── Clear checklist history logs ──────────────────────────────────────────

export async function clearChecklistHistoryAction(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  try {
    await connectToDatabase();
    await ChecklistHistory.deleteMany({ user_id: session.user.id });
    return true;
  } catch (error) {
    console.error("Error clearing checklist history:", error);
    return false;
  }
}
