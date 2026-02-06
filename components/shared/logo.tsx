"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Typography } from "./Typography"

interface LogoProps {
  size?: "small" | "medium" | "large" | "xlarge"
  className?: string
  link?: boolean
  image?: boolean | "small" | "large"
}

export function Logo({ size = "medium", className = "", link = false, image = false }: LogoProps) {
  const rosterSizeClass = size === "medium" ? "text-xl sm:text-2xl" : size === "large" ? "text-3xl sm:text-4xl" : size === "xlarge" ? "text-4xl sm:text-5xl" : ""
  const thSizeClass = size === "large" ? "text-2xl sm:text-3xl" : size === "xlarge" ? "text-3xl sm:text-4xl" : ""

  const useLargeImage = image === true ? (size === 'large' || size === 'xlarge') : image === 'large'
  const imgSrc = useLargeImage ? '/images/logos/logo512.png' : '/images/logos/logo.png'
  const imgSize = useLargeImage ? 40 : 24

  const logoContent = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {image && (
        <Image src={imgSrc} alt="Logo" width={imgSize} height={imgSize} className="rounded-sm" />
      )}
      <Typography size={size} weight="bold">
        <span className={`!text-gray-500 dark:!text-gray-300 leading-none ${thSizeClass}`}>TH</span>
        <span className={`ml-0.5 font-extrabold leading-none bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-sm ${rosterSizeClass}`}>
          roster
        </span>
      </Typography>
    </span>
  )

  if (link) {
    return (
      <Link href="/" aria-label="Homepage">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
