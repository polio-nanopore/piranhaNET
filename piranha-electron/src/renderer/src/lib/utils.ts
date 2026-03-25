import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Util suggested by https://www.shadcn-svelte.com/docs/installation/manual to make it easier to conditionally add and
 * merge Tailwind CSS classes.
 * @param inputs
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
