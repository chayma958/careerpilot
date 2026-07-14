import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { secondaryButtonClass } from "../lib/ui";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  return ctx;
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<(value: boolean) => void>(() => {});

  const confirm = useCallback<ConfirmFn>((input) => {
    const normalized = typeof input === "string" ? { message: input } : input;
    setOptions(normalized);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function handle(result: boolean) {
    setOptions(null);
    resolveRef.current(result);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => handle(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {options.title ?? "Are you sure?"}
            </h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">{options.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => handle(false)} className={`${secondaryButtonClass} px-4 py-2`}>
                Cancel
              </button>
              <button
                onClick={() => handle(true)}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                {options.confirmLabel ?? "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
