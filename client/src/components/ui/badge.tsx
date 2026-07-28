import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium w-fit whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary border-primary/20',
        gold: 'bg-gold/15 text-gold-foreground border-gold/30 dark:text-gold',
        outline: 'bg-transparent text-foreground border-border',
        muted: 'bg-muted text-muted-foreground border-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
