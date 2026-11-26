"use client"

import { signOut } from "next-auth/react";

export default function LogOutButton() {
    async function handleLogout() {
        await signOut({
            redirect: false,
        });

        window.location.href = "/login";
    }

    return (
        <button
            onClick= {handleLogout}
            className="rounded border px-4 py-2"
        >
            Logout
        </button>
    );
}