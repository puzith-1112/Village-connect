import { createContext, useContext, useMemo, useState } from "react";
const RadioGroupContext = createContext(null);
function RadioGroup({ defaultValue, value: controlledValue, onValueChange, children, className, ...props }) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = controlledValue ?? uncontrolled;
  const api = useMemo(() => ({
    value,
    setValue(next) {
      if (controlledValue === void 0) setUncontrolled(next);
      onValueChange?.(next);
    }
  }), [controlledValue, onValueChange, value]);
  return <RadioGroupContext.Provider value={api}>
      <div className={className} {...props}>{children}</div>
    </RadioGroupContext.Provider>;
}
function RadioGroupItem({ value, id, className, ...props }) {
  const context = useContext(RadioGroupContext);
  return <input id={id} type="radio" value={value} checked={context?.value === value} onChange={() => context?.setValue(value)} className={className} {...props} />;
}
export {
  RadioGroup,
  RadioGroupItem
};
