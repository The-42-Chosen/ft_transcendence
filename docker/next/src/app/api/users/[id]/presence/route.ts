import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try { 
        const { id } = await params;
        const userId = Number(id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return NextResponse.json(
                { error: "Invalid user id" },
                { status: 400 }
            );
        }

        const user = await db.orm.public.User
            .where({ id: userId })
            .first();
        
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const updateUser = await db.orm.public.User
            .where({ id: userId })
            .update({
                lastSeen: new Date().toISOString(),
            });

        return NextResponse.json(updateUser);
    }
    catch (error) {
        console.error("Presence update failed:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}