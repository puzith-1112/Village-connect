import React from "react";
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function Button({ className, variant = "default", size = "default", type = "button", ...props }) {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-muted",
    ghost: "hover:bg-muted"
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-11 px-8"
  };
  return <button type={type} className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)} {...props} />;
}
export {
  Button
};
