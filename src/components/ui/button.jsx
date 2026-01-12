import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-[#D6B25E] to-[#F2D27C] text-black shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-500",
        outline:
          "border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] text-white shadow-sm hover:bg-[rgba(255,255,255,0.09)] backdrop-blur-xl",
        secondary:
          "bg-[rgba(255,255,255,0.06)] text-white shadow-sm hover:bg-[rgba(255,255,255,0.09)] backdrop-blur-xl",
        ghost: "hover:bg-[rgba(255,255,255,0.06)] hover:text-white text-[rgba(255,255,255,0.62)]",
        link: "text-[#D6B25E] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }