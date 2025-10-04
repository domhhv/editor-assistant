import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import cn from '@/lib/utils/cn';

const inputVariants = cva(
  'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 w-full min-w-0 rounded-md px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'dark:bg-input/30 border-input border bg-transparent',
        secondary: 'bg-secondary text-secondary-foreground border-0',
      },
    },
  }
);

function Input({
  className,
  type,
  variant,
  ...props
}: React.ComponentProps<'input'> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ className, variant }))}
      {...props}
    />
  );
}

export { Input, inputVariants };
