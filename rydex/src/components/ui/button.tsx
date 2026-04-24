"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      intent: {
        default: "bg-slate-900 text-white hover:bg-slate-700",
        secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-100",
        outline: "border border-slate-200 bg-transparent text-slate-900 hover:bg-slate-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-8 text-base",
      },
    },
    defaultVariants: {
      intent: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ intent, size }), className)}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"
export default Button
