import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, GraduationCap, LayoutDashboard } from 'lucide-react';
import { useScrolled } from '@/hooks/use-scrolled';
import { useTheme } from 'next-themes';
import { NAV_LINKS } from '@/constants/site';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

export function Navbar() {
  const scrolled = useScrolled();
  const location = useLocation();
  const { resolvedTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = location.pathname === '/';
  const transparentMode = isHome && !scrolled;
  const useWhiteText = transparentMode || resolvedTheme === 'dark';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        transparentMode ? 'bg-transparent py-5' : 'border-b border-border/60 py-3 shadow-sm',
        !transparentMode && (resolvedTheme === 'dark' ? 'bg-background/80 backdrop-blur-xl' : 'bg-white/85 backdrop-blur-xl')
      )}
    >
      <div className="section-container flex items-center justify-between">
        <Link to="/" className="flex items-center" aria-label="Target Classes home">
          <img
            src={useWhiteText ? '/brand/logo-horizontal-dark.svg' : '/brand/logo-horizontal-light.svg'}
            alt="Target Classes"
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  useWhiteText ? 'text-white/85 hover:bg-white/10 hover:text-white' : 'text-foreground/75 hover:bg-accent hover:text-foreground',
                  isActive && (useWhiteText ? 'bg-white/15 text-white' : 'bg-accent text-foreground')
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle inverted={useWhiteText} />
          <Button asChild variant="outline" size="sm" className={cn('hidden md:inline-flex', useWhiteText && 'border-white/30 text-white hover:bg-white/10 hover:text-white')}>
            <a href="/student-portal">
              <LayoutDashboard className="size-4" /> Portal Login
            </a>
          </Button>
          <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
            <Link to="/admission">
              <GraduationCap className="size-4" /> Admission
            </Link>
          </Button>

          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn('lg:hidden', useWhiteText && 'text-white hover:bg-white/15 hover:text-white')}
                aria-label="Open menu"
              >
                <Menu className="size-6" />
              </Button>
            </Dialog.Trigger>
            <AnimatePresence>
              {mobileOpen && (
                <Dialog.Portal forceMount>
                  <Dialog.Overlay asChild>
                    <motion.div
                      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  </Dialog.Overlay>
                  <Dialog.Content asChild>
                    <motion.div
                      className="fixed inset-y-0 right-0 z-[70] flex h-full w-[85vw] max-w-sm flex-col bg-card p-6 shadow-2xl"
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                    >
                      <div className="mb-8 flex items-center justify-between">
                        <Dialog.Title asChild>
                          <img src="/brand/logo-horizontal-light.svg" alt="Target Classes" className="h-9 w-auto dark:hidden" />
                        </Dialog.Title>
                        <img src="/brand/logo-horizontal-dark.svg" alt="Target Classes" className="hidden h-9 w-auto dark:block" />
                        <Dialog.Close asChild>
                          <Button variant="ghost" size="icon" aria-label="Close menu">
                            <X className="size-5" />
                          </Button>
                        </Dialog.Close>
                      </div>
                      <nav className="flex flex-col gap-1">
                        {NAV_LINKS.map((link) => (
                          <NavLink
                            key={link.href}
                            to={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                              cn(
                                'rounded-xl px-4 py-3 text-base font-medium transition-colors',
                                isActive ? 'bg-accent text-accent-foreground' : 'text-foreground/80 hover:bg-accent'
                              )
                            }
                          >
                            {link.label}
                          </NavLink>
                        ))}
                      </nav>
                      <div className="mt-auto flex flex-col gap-3 pt-6">
                        <Button asChild variant="outline">
                          <a href="/student-portal">Portal Login</a>
                        </Button>
                        <Button asChild variant="gold">
                          <Link to="/admission" onClick={() => setMobileOpen(false)}>
                            Apply for Admission
                          </Link>
                        </Button>
                      </div>
                    </motion.div>
                  </Dialog.Content>
                </Dialog.Portal>
              )}
            </AnimatePresence>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
