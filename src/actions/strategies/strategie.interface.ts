export interface strategy {
    id: string | null;
    user_id: string | null;
    title: string;
    description: string | null;
}

export interface strategyPrams {
    search?: string | null; // Optional
    limit?: number;
    page?: number;
}

export interface StrategyQuery {
    user_id: string;
    $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
}
