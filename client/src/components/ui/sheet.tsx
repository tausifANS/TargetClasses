import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function Sheet({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

const SIDE_CLASSES = {
  left: 'inset-y-0 left-0 w-[85vw] max-w-sm',
  right: 'inset-y-0 right-0 w-[85vw] max-w-sm',
} as const;

const SIDE_INITIAL = {
  left: { x: '-100%' },
  right: { x: '100%' },
} as const;

function SheetContent({
  className,
  children,
  side = 'left',
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: keyof typeof SIDE_CLASSES;
  showCloseButton?: boolean;
}) {
  return (
    <DialogPrimitive.Portal forceMount data-slot="sheet-portal">
      <DialogPrimitive.Overlay asChild>
        <motion.div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      </DialogPrimitive.Overlay>
      <DialogPrimitive.Content asChild {...props}>
        <motion.div
          data-slot="sheet-content"
          className={cn('fixed z-[70] flex h-full flex-col gap-4 bg-card p-6 shadow-2xl', SIDE_CLASSES[side], className)}
          initial={SIDE_INITIAL[side]}
          animate={{ x: 0 }}
          exit={SIDE_INITIAL[side]}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon" className="absolute top-4 right-4" aria-label="Close">
                <XIcon className="size-5" />
              </Button>
            </DialogPrimitive.Close>
          )}
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/** Wraps children so the sheet only mounts (and animates in) while `open` is true — pass the same `open` state given to <Sheet>. */
function SheetAnimatePresence({ open, children }: { open: boolean; children: React.ReactNode }) {
  return <AnimatePresence>{open && children}</AnimatePresence>;
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sheet-header" className={cn('flex items-center justify-between', className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="sheet-title" className={cn('font-display text-lg font-semibold', className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetAnimatePresence, SheetHeader, SheetTitle };
