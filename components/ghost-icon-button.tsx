"use client";

import React from "react";

type GhostIconButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "asChild"
> & {
  asChild?: boolean;
  children: React.ReactNode;
};

/**
 * Ghost-style icon button without margin issues.
 * Use this instead of Radix IconButton variant="ghost" to avoid negative margins.
 */
export function GhostIconButton({
  className = "",
  children,
  ...props
}: GhostIconButtonProps) {
  const mergedClassName =
    `inline-flex size-7 items-center rounded-full justify-center border-none bg-transparent p-1 text-gray-700 transition-opacity hover:bg-black/5 active:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim();

  if (props.asChild && React.Children.count(children) === 1) {
    const child = React.Children.only(children) as React.ReactElement<{
      className?: string;
    }>;
    return React.cloneElement(child, {
      className: child.props.className
        ? `${mergedClassName} ${child.props.className}`
        : mergedClassName,
      ...props,
    });
  }

  return (
    <button type="button" className={mergedClassName} {...props}>
      {children}
    </button>
  );
}
