import { Spinner } from "./Spinner";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-6 text-sm text-gray-500 dark:text-gray-400">
      <Spinner className="h-4 w-4 text-orange-500" />
      {label}
    </div>
  );
}
