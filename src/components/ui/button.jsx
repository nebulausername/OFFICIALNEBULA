// @ts-nocheck
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"
// removed sound context import if not needed or will re-add if I see it's critical. 
// actually let's keep it but handle the case where it might be missing gracefully as before.
import { useNebulaSound } from "@/contexts/SoundContext";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-gold text-black", // utilizing our new class
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-500",
        outline:
          "btn-outline", // utilizing our new class
        secondary:
          "bg-[rgba(255,255,255,0.06)] text-white shadow-sm hover:bg-[rgba(255,255,255,0.09)] backdrop-blur-xl",
        ghost: "btn-ghost",
        link: "text-[#D6B25E] underline-offset-4 hover:underline",
        glossy: "glass-gloss text-white hover:bg-white/10 active:scale-95 transition-all duration-300",
        nebula: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300",
      },
      size: {
        default: "h-11 px-6 min-w-[120px]", // Increased size for better touch
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-14 rounded-full px-10 text-base", // Premium large
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  /**
   * @param {Object} props
   * @param {React.ReactNode} [props.children]
   * @param {string} [props.className]
   * @param {string} [props.variant]
   * @param {string} [props.size]
   * @param {boolean} [props.asChild]
   * @param {function} [props.onClick]
   * @param {boolean} [props.disabled]
   * @param {Object} [props.style]
   * @param {React.Ref<HTMLButtonElement>} ref
   */
  ({ className, variant, size, asChild = false, onClick, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    // Safe sound access
    const soundContext = useNebulaSound ? useNebulaSound() : null;
    const playClick = soundContext?.playClick || (() => { });
    const playHover = soundContext?.playHover || (() => { });

    const handleClick = (e) => {
      // Only play sound if context exists
      if (playClick) playClick();
      if (onClick) onClick(e);
    };

    return (
      (<Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        onMouseEnter={() => playHover && playHover()}
        {...props}>
        {children}
      </Comp>)
    );
  })
Button.displayName = "Button"

export { Button, buttonVariants }