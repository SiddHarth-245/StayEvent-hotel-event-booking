import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

// Small pop-up messages in the bottom-right corner
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((type, text) => {
    const id = Math.random();
    setItems((l) => [...l, { id, type, text }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 4000);
  }, []);
  const toast = { success: (t) => push('ok', t), error: (t) => push('err', t) };
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`pop rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${t.type === 'ok' ? 'bg-good' : 'bg-red-600'}`}>{t.text}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
