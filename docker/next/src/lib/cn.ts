import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge class names, the last Tailwind class wins on conflict
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
