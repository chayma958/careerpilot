import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gray-300 py-12 text-center dark:border-gray-700">
      <div className="text-gray-300 dark:text-gray-600">{icon}</div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      {action}
    </div>
  );
}
