"use client"

import { signOut } from "next-auth/react";

export default function LogOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded border px-4 py-2"
        >
            Logout
        </button>
    );
}