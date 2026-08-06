import React, { createContext, useContext, useMemo, useState } from "react";
const DialogContext = createContext(null);
function Dialog({ open: controlledOpen, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const api = useMemo(() => ({
    open,
    setOpen(next) {
      if (controlledOpen === void 0) setInternalOpen(next);
      onOpenChange?.(next);
    }
  }), [controlledOpen, onOpenChange, open]);
  return <DialogContext.Provider value={api}>{children}</DialogContext.Provider>;
}
function DialogTrigger({ children }) {
  const context = useContext(DialogContext);
  if (!children) return null;
  return React.cloneElement(children, {
    onClick: (event) => {
      children.props?.onClick?.(event);
      context?.setOpen(true);
    }
  });
}
function DialogContent({ children, className, ...props }) {
  const context = useContext(DialogContext);
  if (!context?.open) return null;
  return <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={() => context.setOpen(false)} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className={`relative w-full max-w-lg rounded-xl border bg-background p-6 shadow-2xl ${className ?? ""}`} {...props}>
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            onClick={() => context.setOpen(false)}
          >
            x
          </button>
          {children}
        </div>
      </div>
    </>;
}
function DialogHeader({ children, className, ...props }) {
  return <div className={`mb-4 ${className ?? ""}`} {...props}>{children}</div>;
}
function DialogTitle({ children, className, ...props }) {
  return <h2 className={`text-2xl font-semibold ${className ?? ""}`} {...props}>{children}</h2>;
}
export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
};
