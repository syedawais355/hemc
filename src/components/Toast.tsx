"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Icon } from "@/components/Icon";

interface ToastItem { id: number; message: string }
const ToastContext = createContext<(message: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 2400);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div id="toast-root" aria-live="polite">
        {items.map((t) => (
          <div className="toast" key={t.id}>
            <span className="toast__dot"><Icon name="check" size={15} width={2.4} /></span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
