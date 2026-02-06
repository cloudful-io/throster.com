"use client"

import Link from 'next/link'
import { Typography } from "./Typography"

interface LogoProps {
  size?: "small" | "medium" | "large" | "xlarge"
  className?: string
  link?: boolean
}

export function Logo({ size = "medium", className = "", link = false }: LogoProps) {
  const rosterSizeClass = size === "large" ? "text-3xl sm:text-4xl" : size === "xlarge" ? "text-4xl sm:text-5xl" : ""
  const thSizeClass = size === "large" ? "text-2xl sm:text-3xl" : size === "xlarge" ? "text-3xl sm:text-4xl" : ""
  const logo = (
    <Typography size={size} weight="bold" className={`inline-flex items-baseline ${className}`}>
      <span className={`!text-gray-500 dark:!text-gray-300 leading-none ${thSizeClass}`}>TH</span>
      <span className={`ml-0.5 font-extrabold leading-none bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-sm ${rosterSizeClass}`}>
        roster
      </span>
    </Typography>
  )

  if (link) {
    return (
      <Link href="/" aria-label="Homepage">
        {logo}
      </Link>
    )
  }

  return logo
}
