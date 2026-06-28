import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Teach tailwind-merge about our custom `text-label` font-size utility so it
// correctly overrides base `text-sm`/`text-xs` on primitives like Label/Table.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": ["text-label"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
