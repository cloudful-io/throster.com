"use client"

import { useTheme } from "next-themes"
import { Typography } from "./Typography"

interface LogoProps {
  size?: "small" | "medium" | "large"
  className?: string
}

export function Logo({ size = "medium", className = "" }: LogoProps) {
  const { theme } = useTheme()

  return (
    <Typography size="large" weight="bold" color={theme === "dark" ? "light" : "dark"}>
      Throster
    </Typography>
  )
}
