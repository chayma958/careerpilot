import { Spinner } from "./Spinner";

interface LoadingStateProps {
  label?: string;
  centered?: boolean;
}

export function LoadingState({ label = "Loading...", centered = false }: LoadingStateProps) {
  return (
    <div
      className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ${
        centered ? "justify-center py-24" : "py-6"
      }`}
    >
      <Spinner className="h-4 w-4 text-orange-500" />
      {label}
    </div>
  );
}
