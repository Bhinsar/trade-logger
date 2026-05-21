"use server";

import { auth } from "../../app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "../../lib/mongodb";
import { Strategies } from "../../models/Strategies";
import { signOutUser } from "../users/user";
import { revalidatePath } from "next/cache";

import { strategy, strategyPrams, StrategyQuery, getStrategiesResponse } from "./strategie.interface";

export async function getAllStrategies({ 
    limit = 5, 
    page = 1, 
    search = null 
}: strategyPrams): Promise<getStrategiesResponse | null> {
    
    const session = await auth();
    if (!session?.user?.id) {
        await signOutUser();
        return null;
    }

    try {
        await connectToDatabase();

        let query: StrategyQuery = { 
            user_id: session.user.id,
            is_deleted: { $ne: true }
        };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (page - 1) * limit;

        const [strategies, totalCount] = await Promise.all([
            Strategies.find(query)
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit),
            Strategies.countDocuments(query)
        ]);

        const mappedStrategies = strategies.map(s => ({
            id: s._id.toString(),
            _id: s._id.toString(),
            user_id: s.user_id,
            title: s.title,
            description: s.description,
            created_at: s.created_at,
            updated_at: s.updated_at,
        }));

        return {
            strategies: JSON.parse(JSON.stringify(mappedStrategies)),
            totalCount
        };
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

        revalidatePath("/strategy");
        return JSON.parse(JSON.stringify(newStrategy));
    } catch (error) {
        console.error("Create Strategy Error:", error);
        return null;
    }
}

export async function deleteStrategy(id: string): Promise<boolean> {
    const session = await auth();
    if (!session?.user?.id) {
        await signOutUser();
        return false;
    }

    try {
        await connectToDatabase();

        const result = await Strategies.updateOne(
            { _id: id, user_id: session.user.id },
            { $set: { is_deleted: true, delete_at: new Date() } }
        );

        revalidatePath("/strategy");
        return result.modifiedCount > 0;
    } catch (error) {
        console.error("Delete Strategy Error:", error);
        return false;
    }
}

export async function updateStrategy(id: string, data: { title: string, description: string }): Promise<boolean> {
    const session = await auth();
    if (!session?.user?.id) {
        await signOutUser();
        return false;
    }

    try {
        await connectToDatabase();

        const result = await Strategies.updateOne(
            { _id: id, user_id: session.user.id, is_deleted: { $ne: true } },
            { $set: { title: data.title, description: data.description } }
        );

        revalidatePath("/strategy");
        return result.modifiedCount > 0;
    } catch (error) {
        console.error("Update Strategy Error:", error);
        return false;
    }
}


