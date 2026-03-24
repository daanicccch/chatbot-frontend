import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/client/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary px-4 py-2 text-primary-foreground shadow hover:bg-primary/90",
        primary:
          "bg-[var(--app-inverse)] px-4 py-2 text-[var(--app-inverse-text)] hover:opacity-90",
        secondary:
          "border border-border bg-[var(--app-surface)] px-4 py-2 text-[var(--app-text)] hover:bg-[var(--app-hover)]",
        ghost:
          "px-3 py-2 text-[var(--app-muted)] hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]",
        subtle:
          "border border-border bg-[var(--app-surface-subtle)] px-4 py-2 text-[var(--app-text)] hover:bg-[var(--app-hover)]",
        destructive:
          "bg-destructive px-4 py-2 text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4",
        lg: "h-12 px-5 text-[15px]",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
