import {type ClassValue, clsx} from "clsx";
import { twMerge } from "tailwind-merge";

const SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;


export function cn(...inputs: ClassValue[]){
  return twMerge(clsx(...inputs))
}



/**
 * Format a byte count as a human-readable size.
 *
 *   formatSize(512)        → "512 B"
 *   formatSize(1536)       → "1.5 KB"
 *   formatSize(20971520)   → "20 MB"
 *   formatSize(3.2e9)      → "3 GB"
 *
 * Uses 1024-based units (the convention file pickers and OS dialogs use).
 * `decimals` caps the fractional digits; trailing zeros are dropped.
 */
export function formatSize(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${Math.round(bytes)} B`;

  let exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    SIZE_UNITS.length - 1,
  );
  let value = bytes / 1024 ** exponent;

  // 1023.96 KB would otherwise print as "1024 KB" instead of "1 MB".
  if (
    Number(value.toFixed(decimals)) >= 1024 &&
    exponent < SIZE_UNITS.length - 1
  ) {
    exponent += 1;
    value /= 1024;
  }

  const text = value.toFixed(decimals).replace(/\.?0+$/, "");
  return `${text} ${SIZE_UNITS[exponent]}`;
}


export const generateUUID = () => crypto.randomUUID();
