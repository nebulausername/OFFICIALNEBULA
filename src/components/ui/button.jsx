// @ts-nocheck
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"
import { useNebulaSound } from "@/contexts/SoundContext";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-[#E8C76A] to-[#F5D98B] text-[#1A1A1A] font-black shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-500",
        outline:
          "border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] text-white shadow-sm hover:bg-[rgba(255,255,255,0.09)] backdrop-blur-xl",
        secondary:
          "bg-[rgba(255,255,255,0.06)] text-white shadow-sm hover:bg-[rgba(255,255,255,0.09)] backdrop-blur-xl",
        ghost: "hover:bg-[rgba(255,255,255,0.06)] hover:text-white text-[rgba(255,255,255,0.62)]",
        link: "text-[#D6B25E] underline-offset-4 hover:underline",
        glossy: "glass-gloss text-white hover:bg-white/10 active:scale-95 transition-all duration-300",
        nebula: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300",
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

const Button = React.forwardRef(({ className, variant, size, asChild = false, onClick, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const soundContext = useNebulaSound ? useNebulaSound() : null;
  const playClick = soundContext?.playClick || (() => { });
  const playHover = soundContext?.playHover || (() => { });

  const handleClick = (e) => {
    playClick();
    if (onClick) onClick(e);
  };

  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      onClick={handleClick}
      onMouseEnter={() => playHover()}
      {...props}>
      {children}
    </Comp>)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }