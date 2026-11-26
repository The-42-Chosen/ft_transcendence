import { z } from "zod";
import bcrypt from "bcryptjs";

export const PASSWORD_MIN = 8;

// bcrypt only reads the first 72 bytes (bytes, not characters: "é" counts for 2).
// A longer password would be accepted with any ending, so it is refused instead.
export const passwordSchema = z
	.string()
	.min(PASSWORD_MIN)
	.refine((password) => !bcrypt.truncates(password), {
		message: "Password too long (72 bytes max)",
	});
