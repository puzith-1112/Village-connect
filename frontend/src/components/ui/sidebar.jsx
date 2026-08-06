import React from "react";
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function SidebarProvider({ children }) {
  return <>{children}</>;
}
function Sidebar({ className, ...props }) {
  return <aside
    className={cn(
      "w-64 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground",
      className
    )}
    {...props}
  />;
}
function SidebarHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-2 px-6 py-5 border-b border-border/50", className)} {...props} />;
}
function SidebarContent({ className, ...props }) {
  return <div className={cn("flex-1 overflow-auto px-3 py-6", className)} {...props} />;
}
function SidebarFooter({ className, ...props }) {
  return <div className={cn("border-t border-border/50 px-6 py-5", className)} {...props} />;
}
function SidebarGroup({ className, ...props }) {
  return <div className={cn("overflow-hidden px-2 py-4", className)} {...props} />;
}
function SidebarGroupLabel({ className, ...props }) {
  return <div
    className={cn(
      "px-4 py-2 text-sm font-medium text-muted-foreground",
      className
    )}
    {...props}
  />;
}
function SidebarGroupContent({ className, ...props }) {
  return <div className={cn("", className)} {...props} />;
}
function SidebarMenu({ className, ...props }) {
  return <ul className={cn("flex flex-col gap-1", className)} {...props} />;
}
function SidebarMenuItem({ className, ...props }) {
  return <li className={cn("", className)} {...props} />;
}
function SidebarMenuButton({ children, className, asChild, isActive, ...props }) {
  const baseClasses = cn(
    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
    "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
    isActive && "bg-sidebar-accent text-sidebar-foreground font-semibold",
    className
  );
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { className: cn(children.props.className, baseClasses) });
  }
  return <button
    className={baseClasses}
    {...props}
  >
      {children}
    </button>;
}
function SidebarTrigger({ className, ...props }) {
  return <button
    type="button"
    className={cn(
      "flex items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors",
      className
    )}
    {...props}
  >
      Menu
    </button>;
}
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
};
