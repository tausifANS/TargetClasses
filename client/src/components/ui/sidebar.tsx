import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sheet, SheetAnimatePresence, SheetContent } from '@/components/ui/sheet';

interface SidebarContextValue {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within a SidebarProvider');
  return ctx;
}

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const value = React.useMemo(() => ({ mobileOpen, setMobileOpen }), [mobileOpen]);
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

/** Fixed desktop rail. Renders nothing below `lg:` — use <SidebarMobile> for the drawer. */
function Sidebar({ className, children, ...props }: React.ComponentProps<'aside'>) {
  return (
    <aside
      data-slot="sidebar"
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex',
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

function SidebarMobile({ children }: { children: React.ReactNode }) {
  const { mobileOpen, setMobileOpen } = useSidebar();
  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetAnimatePresence open={mobileOpen}>
        <SheetContent side="left" className="w-72 gap-0 p-0">
          {children}
        </SheetContent>
      </SheetAnimatePresence>
    </Sheet>
  );
}

function SidebarTrigger({ children }: { children: (open: () => void) => React.ReactNode }) {
  const { setMobileOpen } = useSidebar();
  return <>{children(() => setMobileOpen(true))}</>;
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sidebar-header" className={cn('flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-5', className)} {...props} />;
}

function SidebarContent({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav data-slot="sidebar-content" className={cn('flex-1 space-y-1 overflow-y-auto p-3', className)} {...props} />;
}

function SidebarSection({ label, className, children }: { label?: string; className?: string; children: React.ReactNode }) {
  return (
    <div data-slot="sidebar-section" className={cn('space-y-1 py-2 first:pt-0', className)}>
      {label && <p className="px-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>}
      {children}
    </div>
  );
}

function SidebarNavItem({
  to,
  icon: Icon,
  children,
  onNavigate,
  end,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onNavigate?: () => void;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          isActive ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-accent hover:text-foreground'
        )
      }
    >
      <Icon className="size-4.5 shrink-0" />
      <span className="truncate">{children}</span>
    </NavLink>
  );
}

export {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarMobile,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarSection,
  SidebarNavItem,
};
