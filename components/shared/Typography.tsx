// components/shared/typography.tsx
"use client"

import { cva } from "class-variance-authority"

const typography = cva("", {
  variants: {
    size: {
      small: "text-sm",
      medium: "text-base",
      large: "text-2xl",
    },
    weight: {
      normal: "font-normal",
      bold: "font-bold",
    },
    color: {
      light: "text-foreground",
      dark: "text-muted-foreground",
    },
  },
  defaultVariants: {
    size: "medium",
    weight: "normal",
    color: "light",
  },
})

interface TypographyProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "small" | "medium" | "large"
  weight?: "normal" | "bold"
  color?: "light" | "dark"
}

export function Typography({ size, weight, color, className = "", children, ...props }: TypographyProps) {
  return (
    <span className={typography({ size, weight, color, className })} {...props}>
      {children}
    </span>
  )
}
