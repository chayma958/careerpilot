import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Application } from "../types";
import { STATUS_COLORS, STATUS_COLORS_DARK } from "../lib/statusColors";
import { useTheme } from "../context/ThemeContext";

interface KanbanCardProps {
  application: Application;
  onClick: () => void;
}

function LocationIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

function SalaryIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m3-8.25c0-1.243-1.343-2.25-3-2.25s-3 1.007-3 2.25 1.343 2.25 3 2.25 3 1.007 3 2.25-1.343 2.25-3 2.25-3-1.007-3-2.25"
      />
    </svg>
  );
}

export function KanbanCard({ application, onClick }: KanbanCardProps) {
  const { theme } = useTheme();
  const accentColor = (theme === "dark" ? STATUS_COLORS_DARK : STATUS_COLORS)[application.status];
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: application.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    borderLeftColor: accentColor,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="cursor-grab rounded-lg border border-l-4 border-gray-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-gray-700 dark:bg-gray-800"
    >
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{application.company}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{application.position}</p>
      {(application.location || application.salary) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
          {application.location && (
            <span className="flex items-center gap-1">
              <LocationIcon />
              {application.location}
            </span>
          )}
          {application.salary && (
            <span className="flex items-center gap-1">
              <SalaryIcon />
              {application.salary}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
