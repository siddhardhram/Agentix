import React, { createContext, useContext } from 'react';

const TabsContext = createContext({
  value: '',
  onValueChange: () => {}
});

export function Tabs({ value, onValueChange, defaultValue, className = '', children }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  const activeValue = value !== undefined ? value : internalValue;
  const setActiveValue = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: setActiveValue }}>
      <div className={`ui-tabs ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = '', children }) {
  return <div className={`ui-tabs-list ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, className = '', children, ...props }) {
  const context = useContext(TabsContext);
  const isActive = context.value === value;

  return (
    <button
      type="button"
      className={`ui-tabs-trigger ${isActive ? 'is-active' : ''} ${className}`}
      onClick={() => context.onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = '', children }) {
  const context = useContext(TabsContext);
  if (context.value !== value) return null;

  return <div className={`ui-tabs-content ${className}`}>{children}</div>;
}
