function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function Label({ className, ...props }) {
  return <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />;
}
export {
  Label
};
