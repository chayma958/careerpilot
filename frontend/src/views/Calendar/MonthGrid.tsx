import { dateKey } from "../../lib/calendar";
import type { Interview } from "../../types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MonthGridProps {
  viewDate: Date;
  today: Date;
  selectedKey: string;
  grid: Date[];
  interviewsByDay: Map<string, Interview[]>;
  onGoToMonth: (offset: number) => void;
  onSelectDate: (date: Date) => void;
}

export function MonthGrid({
  viewDate,
  today,
  selectedKey,
  grid,
  interviewsByDay,
  onGoToMonth,
  onSelectDate,
}: MonthGridProps) {
  return (
    <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => onGoToMonth(-1)}
          className="px-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ‹
        </button>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <button
          onClick={() => onGoToMonth(1)}
          className="px-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 dark:text-gray-500">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((day) => {
          const key = dateKey(day);
          const isCurrentMonth = day.getMonth() === viewDate.getMonth();
          const isToday = key === dateKey(today);
          const isSelected = key === selectedKey;
          const count = interviewsByDay.get(key)?.length ?? 0;

          return (
            <button
              key={key}
              onClick={() => onSelectDate(day)}
              className={`flex h-16 flex-col items-center justify-start rounded-md p-1 text-sm transition-colors ${
                isSelected
                  ? "bg-orange-600 text-white dark:bg-orange-500"
                  : isToday
                    ? "bg-orange-50 text-orange-900 dark:bg-orange-950 dark:text-orange-200"
                    : isCurrentMonth
                      ? "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      : "text-gray-300 hover:bg-gray-50 dark:text-gray-600 dark:hover:bg-gray-700"
              }`}
            >
              <span>{day.getDate()}</span>
              {count > 0 && (
                <span className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-orange-500"}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
