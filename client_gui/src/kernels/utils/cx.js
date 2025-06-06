import clsx from "clsx"
import { twMerge } from "tailwind-merge"

export function cx(...args) {
  return twMerge(clsx(...args))
}

export const focusInput = [
  "focus:ring-2",
  "focus:ring-blue-200 focus:dark:ring-blue-700/30",
  "focus:border-blue-500 focus:dark:border-blue-700",
]

export const focusRing = [
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  "outline-blue-500 dark:outline-blue-500",
]

export const hasErrorInput = [
  "ring-2",
  "border-red-500 dark:border-red-700",
  "ring-red-200 dark:ring-red-700/30",
]

export const formatters = {
  currency: ({
    number,
    maxFractionDigits = 2,
    currency = "USD",
  }) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: maxFractionDigits,
    }).format(number),

  unit: (number) => {
    const formattedNumber = new Intl.NumberFormat("en-US", {
      style: "decimal",
    }).format(number)
    return `${formattedNumber}`
  },

  percentage: ({
    number,
    decimals = 1,
  }) => {
    const formattedNumber = new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number)
    const symbol = number > 0 && number !== Infinity ? "+" : ""

    return `${symbol}${formattedNumber}`
  },

  million: ({
    number,
    decimals = 1,
  }) => {
    const formattedNumber = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number)
    return `${formattedNumber}M`
  },
}
