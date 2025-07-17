'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  title?: string;
  description?: string;
  type?: 'default' | 'success' | 'error';
  duration?: number;
}

interface ToastContextValue {
  showToast: (props: ToastProps) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([]);

  const showToast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastPrimitives.Provider swipeDirection="right">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id);
            }}
          />
        ))}
        <ToastPrimitives.Viewport
          className="fixed bottom-0 right-0 flex flex-col p-4 gap-2 w-full max-w-sm z-50"
        />
      </ToastPrimitives.Provider>
    </ToastContext.Provider>
  );
}

function Toast({
  title,
  description,
  type = 'default',
  duration = 5000,
  onOpenChange,
}: ToastProps & { onOpenChange: (open: boolean) => void }) {
  const [open, setOpen] = React.useState(true);

  return (
    <ToastPrimitives.Root
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        onOpenChange(newOpen);
      }}
      duration={duration}
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[swipe=end]:animate-out data-[state=closed]:fade-out-80',
        'data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full',
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
        {
          'bg-card border': type === 'default',
          'bg-green-950/50 border-green-900/50 text-green-50': type === 'success',
          'bg-red-950/50 border-red-900/50 text-red-50': type === 'error',
        }
      )}
    >
      <div className="grid gap-1">
        {title && (
          <ToastPrimitives.Title className="text-sm font-semibold">
            {title}
          </ToastPrimitives.Title>
        )}
        {description && (
          <ToastPrimitives.Description className="text-sm opacity-90">
            {description}
          </ToastPrimitives.Description>
        )}
      </div>
      <ToastPrimitives.Close
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </ToastPrimitives.Close>
    </ToastPrimitives.Root>
  );
}