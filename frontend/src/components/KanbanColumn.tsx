import { useDroppable } from "@dnd-kit/core";
import type { Application, ApplicationStatus } from "../types";
import { STATUS_COLORS, STATUS_COLORS_DARK, STATUS_LABELS } from "../lib/statusColors";
import { useTheme } from "../context/ThemeContext";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: Application[];
  onCardClick: (applicationId: string) => void;
}

export function KanbanColumn({ status, applications, onCardClick }: KanbanColumnProps) {
  const { theme } = useTheme();
  const accentColor = (theme === "dark" ? STATUS_COLORS_DARK : STATUS_COLORS)[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded-lg border p-3 transition-colors ${
        isOver
          ? "border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-950"
          : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accentColor }} />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {STATUS_LABELS[status]}
          </h3>
        </div>
        <span
          className="rounded-full px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400"
          style={{ backgroundColor: `${accentColor}1a` }}
        >
          {applications.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {applications.map((app) => (
          <KanbanCard key={app.id} application={app} onClick={() => onCardClick(app.id)} />
        ))}
        {applications.length === 0 && (
          <div className="rounded-md border border-dashed border-gray-300 py-6 text-center text-xs text-gray-400 dark:border-gray-700 dark:text-gray-600">
            No applications here
          </div>
        )}
      </div>
    </div>
  );
}
