"use client"

import { signOut } from "next-auth/react";

export default function LogOutButton() {
    return (
        <button
            onClick={() => signOut({ redirectTo: "/login" })}
            className="rounded border px-4 py-2"
        >
            Logout
        </button>
    );
}