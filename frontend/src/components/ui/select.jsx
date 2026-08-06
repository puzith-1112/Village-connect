import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
const SelectContext = createContext(null);
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function Select({ defaultValue, value: controlledValue, onValueChange, children, className, ...props }) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [labels, setLabels] = useState({});
  const rootRef = useRef(null);
  const value = controlledValue ?? uncontrolled;

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const api = useMemo(() => ({
    value,
    open,
    setOpen,
    registerLabel(optionValue, label) {
      setLabels((prev) => {
        if (prev[optionValue] === label) return prev;
        return { ...prev, [optionValue]: label };
      });
    },
    getLabel(optionValue) {
      return labels[optionValue];
    },
    setValue(next) {
      if (controlledValue === void 0) setUncontrolled(next);
      onValueChange?.(next);
      setOpen(false);
    }
  }), [controlledValue, labels, onValueChange, open, value]);

  return <SelectContext.Provider value={api}><div ref={rootRef} className={cn("relative", className)} {...props}>{children}</div></SelectContext.Provider>;
}
function SelectTrigger({ children, className, ...props }) {
  const context = useContext(SelectContext);
  return <button
    type="button"
    className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm", className)}
    onClick={() => context?.setOpen(!context?.open)}
    {...props}
  >
      <span className="truncate">{children}</span>
      <span className="ml-2 text-muted-foreground">v</span>
    </button>;
}
function SelectValue({ placeholder }) {
  const context = useContext(SelectContext);
  const selected = context?.value;
  return <span>{(selected && context?.getLabel(selected)) || selected || placeholder || ""}</span>;
}
function SelectContent({ children, className, ...props }) {
  const context = useContext(SelectContext);
  if (!context?.open) return null;
  return <div className={cn("absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background p-1 shadow-md", className)} {...props}>{children}</div>;
}
function SelectItem({ value, children, className, ...props }) {
  const context = useContext(SelectContext);
  const label = typeof children === "string" ? children : value;

  useEffect(() => {
    context?.registerLabel(value, label);
  }, [context, label, value]);

  return <button
    type="button"
    className={cn("block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted", className)}
    onClick={() => context?.setValue(value)}
    {...props}
  >
      {children}
    </button>;
}
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
};
