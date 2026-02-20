"use client";

import React from "react";

type GhostButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "asChild"
> & {
  /** "icon" = icon-only compact, "icon-text" = full-width icon+text, "text" = full-width text only */
  layout?: "icon" | "icon-text" | "text";
  /** When true, shows selected/current state (e.g. current page in sidebar) */
  isActive?: boolean;
  /** When true, renders the child element with merged props (e.g. Link) */
  asChild?: boolean;
  children: React.ReactNode;
};

/**
 * Ghost-style button without margin. Use instead of Radix IconButton/Button variant="ghost"
 * to avoid layout issues from Radix's negative margins on ghost buttons.
 */
export function GhostButton({
  layout = "icon",
  isActive = false,
  asChild = false,
  className = "",
  children,
  ...props
}: GhostButtonProps) {
  const base =
    "m-0 inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-md border-none bg-transparent p-0 text-gray-700 transition-colors hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50";
  const activeClass = isActive
    ? "bg-gray-300 hover:bg-gray-300 active:bg-gray-400"
    : "";

  const layoutClasses = {
    icon: "h-7 w-7 shrink-0 p-1",
    "icon-text":
      "min-h-8 w-full justify-start px-3 py-1.5 text-left text-[13px]",
    text: "min-h-8 w-full justify-start px-3 py-1.5 text-left text-[13px]",
  };

  const mergedClassName =
    `${base} ${layoutClasses[layout]} ${activeClass} ${className}`.trim();

  if (asChild && React.Children.count(children) === 1) {
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
