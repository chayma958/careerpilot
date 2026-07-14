import { useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listApplications, updateApplicationStatus } from "../api/applications";
import type { Application, ApplicationStatus } from "../types";
import { STATUS_ORDER } from "../lib/statusColors";
import { KanbanColumn } from "../components/KanbanColumn";
import { ApplicationPreviewModal } from "../components/ApplicationPreviewModal";
import { LoadingState } from "../components/LoadingState";

export function KanbanPage() {
  const queryClient = useQueryClient();
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => listApplications(),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      updateApplicationStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["applications"] });
      const previous = queryClient.getQueryData<Application[]>(["applications"]);
      queryClient.setQueryData<Application[]>(["applications"], (old) =>
        old?.map((app) => (app.id === id ? { ...app, status } : app)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["applications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const applicationId = active.id as string;
    const newStatus = over.id as ApplicationStatus;
    const application = applications?.find((app) => app.id === applicationId);

    if (application && application.status !== newStatus) {
      statusMutation.mutate({ id: applicationId, status: newStatus });
    }
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Kanban Board</h1>

      {isLoading && <LoadingState />}

      {applications && (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                applications={applications.filter((app) => app.status === status)}
                onCardClick={setPreviewingId}
              />
            ))}
          </div>
        </DndContext>
      )}

      {previewingId && (
        <ApplicationPreviewModal applicationId={previewingId} onClose={() => setPreviewingId(null)} />
      )}
    </div>
  );
}
