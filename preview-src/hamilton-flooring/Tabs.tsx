import { createContext, useContext, useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from 'react';

type TabsState = { value: string; onValueChange: (value: string) => void; id: string };
const TabsContext = createContext<TabsState | null>(null);

function useTabs() {
  const tabs = useContext(TabsContext);
  if (!tabs) throw new Error('Material tabs require their Tabs parent.');
  return tabs;
}

export function Tabs({ value, onValueChange, children, className }: Omit<TabsState, 'id'> & { children: ReactNode; className?: string }) {
  const id = useId();
  return <TabsContext.Provider value={{ value, onValueChange, id }}><div className={className}>{children}</div></TabsContext.Provider>;
}

export function TabsList({ children, variant, ...props }: HTMLAttributes<HTMLDivElement> & { variant?: string }) {
  return <div role="tablist" data-variant={variant} {...props}>{children}</div>;
}

export function TabsTrigger({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const tabs = useTabs();
  const active = tabs.value === value;
  return <button
    type="button"
    role="tab"
    id={`${tabs.id}-tab-${value}`}
    aria-controls={`${tabs.id}-panel-${value}`}
    aria-selected={active}
    tabIndex={active ? 0 : -1}
    data-active={active ? '' : undefined}
    className={className}
    onClick={() => tabs.onValueChange(value)}
    onKeyDown={event => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const triggers = Array.from(event.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
      const index = triggers.indexOf(event.currentTarget);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? triggers.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + triggers.length) % triggers.length;
      triggers[next].focus();
      triggers[next].click();
    }}
  >{children}</button>;
}

export function TabsContent({ value, children, ...props }: HTMLAttributes<HTMLDivElement> & { value: string }) {
  const tabs = useTabs();
  const active = tabs.value === value;
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) return;
    const element = panel.current;
    if (!element) return;
    element.setAttribute('data-starting-style', '');
    let endFrame = 0;
    const frame = requestAnimationFrame(() => { endFrame = requestAnimationFrame(() => element.removeAttribute('data-starting-style')); });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(endFrame); };
  }, [active]);
  return <div
    {...props}
    ref={panel}
    role="tabpanel"
    id={`${tabs.id}-panel-${value}`}
    aria-labelledby={`${tabs.id}-tab-${value}`}
    hidden={!active}
    inert={!active}
    tabIndex={active ? 0 : -1}
  >{children}</div>;
}
