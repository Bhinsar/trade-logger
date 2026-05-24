export enum ChecklistCategory {
  PreMarket = "Pre-Market",
  Entry = "Entry",
  RiskManagement = "Risk Management",
  Exit = "Exit",
  PostTrade = "Post-Trade",
}

export enum ChecklistPriority {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}

export interface ChecklistItemInterface {
  id?: string;
  user_id?: string;
  title: string;
  description?: string | null;
  category: ChecklistCategory;
  priority: ChecklistPriority;
  order: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface ChecklistItemResponse {
  id: string;
  title: string;
  description: string | null;
  category: ChecklistCategory;
  priority: ChecklistPriority;
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ChecklistDocument {
  _id: { toString(): string };
  user_id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  order: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface HistoryRecordResponse {
  id: string;
  date: Date;
  total: number;
  completed: number;
  percentage: number;
  items: string[];
  created_at: Date;
}

export interface ChecklistSessionResponse {
  id: string;
  date_string: string;
  completed_ids: string[];
}
