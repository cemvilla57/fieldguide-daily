import * as React from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      <div className="relative z-50">{children}</div>
    </div>
  );
};

const DialogTrigger = ({ children, asChild, ...props }: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) => (
  <div {...props}>{children}</div>
);

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg', className)}
      {...props}
    >
      {children}
    </div>
  )
);
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left mb-4', className)} {...props} />
);

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-lg font-semibold', className)} {...props} />
  )
);
DialogTitle.displayName = 'DialogTitle';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4', className)} {...props} />
);

const DialogClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button ref={ref} className={cn('absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100', className)} {...props}>
      {children ?? '✕'}
    </button>
  )
);
DialogClose.displayName = 'DialogClose';

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose };
