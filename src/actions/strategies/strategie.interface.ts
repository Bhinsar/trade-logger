export interface strategy {
    id: string | null;
    _id?: string;
    user_id: string | null;
    title: string;
    description: string | null;
    created_at?: string | Date;
    updated_at?: string | Date;
}

export interface strategyPrams {
    search?: string | null; // Optional
    limit?: number;
    page?: number;
}

export interface StrategyQuery {
    user_id: string;
    is_deleted?: { $ne: boolean };
    $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
}

export interface getStrategiesResponse {
    strategies: strategy[];
    totalCount: number;
}

