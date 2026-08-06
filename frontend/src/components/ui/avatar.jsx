function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function Avatar({ className, ...props }) {
  return <div className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />;
}
function AvatarFallback({ className, ...props }) {
  return <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props} />;
}
export {
  Avatar,
  AvatarFallback
};
