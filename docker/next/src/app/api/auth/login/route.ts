import { NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
}).strict();

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const parsed = loginSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Invalid request body",
                    details: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        const { email, password } = parsed.data;

        const user = await db.orm.public.User
            .where({ email })
            .first();

        if (!user || !user.passwordHash) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        const passwordIsValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordIsValid) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                displayName: user.displayName,
                bio: user.bio,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    catch(error) {
        console.error("Login failed:", error);

        return NextResponse.json(
            { error: "Internal server errror"},
            { status: 500 }
        );
    }
}