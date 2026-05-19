"use server";

import { auth } from "../../app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "../../lib/mongodb";
import { Strategies } from "../../models/Strategies";
import { signOutUser } from "../users/user";

import { strategy, strategyPrams, StrategyQuery } from "./strategie.interface";

export async function getAllStrategies({ 
    limit = 5, 
    page = 1, 
    search = null 
}: strategyPrams): Promise<strategy[] | null> {
    
    const session = await auth();
    if (!session?.user?.id) {
        await signOutUser();
        return null;
    }

    try {
        await connectToDatabase();

        let query: StrategyQuery = { user_id: session.user.id };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (page - 1) * limit;

        const strategies = await Strategies.find(query)
            .sort({ createdAt: -1 }) // Usually good to show newest first
            .skip(skip)
            .limit(limit);

        return JSON.parse(JSON.stringify(strategies));
    } catch (error) {
        console.error("Fetch Strategies Error:", error);
        return null;
    }
}

export async function createStrategy(data: { title: string, description: string }): Promise<strategy | null> {
    const session = await auth();
    if (!session?.user?.id) {
        await signOutUser();
        return null;
    }

    try {
        await connectToDatabase();

        const newStrategy = await Strategies.create({
            user_id: session.user.id,
            title: data.title,
            description: data.description,
        });

        return JSON.parse(JSON.stringify(newStrategy));
    } catch (error) {
        console.error("Create Strategy Error:", error);
        return null;
    }
}
