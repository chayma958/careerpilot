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
import { useConfirm } from "../components/ConfirmDialog";
import { MonthGrid } from "../views/Calendar/MonthGrid";
import { DayInterviewsPanel } from "../views/Calendar/DayInterviewsPanel";

export function CalendarPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
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

  async function handleDelete(id: string) {
    if (await confirm("Delete this interview?")) {
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
        <MonthGrid
          viewDate={viewDate}
          today={today}
          selectedKey={selectedKey}
          grid={grid}
          interviewsByDay={interviewsByDay}
          onGoToMonth={goToMonth}
          onSelectDate={setSelectedDate}
        />

        <DayInterviewsPanel
          selectedDate={selectedDate}
          interviews={selectedInterviews}
          onDelete={handleDelete}
        />
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
