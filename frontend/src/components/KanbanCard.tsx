import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Application } from "../types";
import { STATUS_COLORS, STATUS_COLORS_DARK } from "../lib/statusColors";
import { useTheme } from "../context/ThemeContext";
import { LocationIcon } from "./icons/LocationIcon";
import { SalaryIcon } from "./icons/SalaryIcon";

interface KanbanCardProps {
  application: Application;
  onClick: () => void;
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
