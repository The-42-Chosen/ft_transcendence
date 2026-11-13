import { NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { log } from "@/lib/log";

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
            log.warn({ service: "auth", msg: "login failed", reason: "unknown_user" });
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
            log.warn({ service: "auth", msg: "login failed", reason: "bad_password", user_id: user.id });
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        log.info({ service: "auth", msg: "login successful", user_id: user.id });
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
        log.error({ service: "auth", msg: "login route failed", error: String(error) });

        return NextResponse.json(
            { error: "Internal server errror"},
            { status: 500 }
        );
    }
}