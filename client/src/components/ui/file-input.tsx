import * as React from 'react';
import { cn } from '@/lib/utils';

/** Styled wrapper around a native file input — forwards its ref so callers can keep reading `ref.current.files[0]` at submit time. */
const FileInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="file"
      data-slot="file-input"
      className={cn(
        'block w-full text-sm text-muted-foreground',
        'file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground',
        'file:cursor-pointer hover:file:bg-secondary/70',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});
FileInput.displayName = 'FileInput';

export { FileInput };
