import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listApplications } from "../api/applications";
import { createInterview, deleteInterview, listInterviews } from "../api/interviews";
import type { Interview } from "../types";
import { dateKey, getMonthGrid } from "../lib/calendar";
import { InterviewFormModal } from "../components/InterviewFormModal";
import type { InterviewFormValues } from "../components/InterviewFormModal";
import { primaryButtonClass } from "../lib/ui";
import { LoadingState } from "../components/LoadingState";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarPage() {
  const queryClient = useQueryClient();
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: interviews, isLoading } = useQuery({
    queryKey: ["interviews"],
    queryFn: listInterviews,
  });

  const { data: applications } = useQuery({
    queryKey: ["applications"],
    queryFn: () => listApplications(),
  });

  const createMutation = useMutation({
    mutationFn: (values: InterviewFormValues) =>
      createInterview({
        applicationId: values.applicationId,
        date: new Date(values.date).toISOString(),
        location: values.location || undefined,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInterview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["interviews"] }),
  });

  const interviewsByDay = useMemo(() => {
    const map = new Map<string, Interview[]>();
    for (const interview of interviews ?? []) {
      const key = dateKey(new Date(interview.date));
      const existing = map.get(key) ?? [];
      existing.push(interview);
      map.set(key, existing);
    }
    return map;
  }, [interviews]);

  const grid = useMemo(
    () => getMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const selectedKey = dateKey(selectedDate);
  const selectedInterviews = interviewsByDay.get(selectedKey) ?? [];

  function goToMonth(offset: number) {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  }

  function handleDelete(id: string) {
    if (window.confirm("Delete this interview?")) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Calendar</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!applications || applications.length === 0}
          className={`${primaryButtonClass} px-4 py-2`}
        >
          New interview
        </button>
      </div>

      {isLoading && <LoadingState />}

      <div className="flex gap-6">
        <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => goToMonth(-1)}
              className="px-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              ‹
            </button>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <button
              onClick={() => goToMonth(1)}
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
                  onClick={() => setSelectedDate(day)}
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
                    <span
                      className={`mt-1 h-1.5 w-1.5 rounded-full ${
                        isSelected ? "bg-white" : "bg-orange-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-80 shrink-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </h3>

          {selectedInterviews.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500">No interviews scheduled.</p>
          )}

          <div className="flex flex-col gap-3">
            {selectedInterviews.map((interview) => (
              <div
                key={interview.id}
                className="rounded-md border border-gray-200 p-3 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(interview.date).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {interview.application.company} — {interview.application.position}
                    </p>
                    {interview.location && (
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        {interview.location}
                      </p>
                    )}
                    {interview.notes && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{interview.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(interview.id)}
                    className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && applications && (
        <InterviewFormModal
          applications={applications}
          defaultDate={`${selectedKey}T09:00`}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(values) => createMutation.mutate(values)}
          isSubmitting={createMutation.isPending}
        />
      )}
    </div>
  );
}
