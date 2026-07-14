import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { listNotifications, markNotificationRead } from "../api/notifications";
import type { Notification } from "../types";
import { LoadingState } from "../components/LoadingState";

const PAGE_SIZE = 20;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["notifications", "all"],
    queryFn: ({ pageParam }) => listNotifications(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  function handleNotificationClick(n: Notification) {
    if (!n.read) markReadMutation.mutate(n.id);
    if (n.applicationId) navigate(`/applications/${n.applicationId}`);
  }

  const notifications = data?.pages.flatMap((p) => p.notifications) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Notifications{" "}
        {total > 0 && (
          <span className="text-base font-normal text-gray-400 dark:text-gray-500">({total})</span>
        )}
      </h1>

      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        You'll get a reminder here the day before a scheduled interview, a nudge to follow up on any
        application still marked "Applied" with no update after 7 days, and a nudge to actually apply to
        anything still marked "Saved" after 3 days. Checked automatically whenever you visit the app — no
        action needed.
      </p>

      {isLoading && <LoadingState />}

      {!isLoading && notifications.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nothing yet — you don't have any interviews scheduled for tomorrow, saved jobs waiting 3+ days, or
          applications stuck for over
          a week. Check back later.
        </p>
      )}

      {notifications.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-4 text-left text-sm last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${
                n.read ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />}
              <div className={n.read ? "pl-5" : ""}>
                <p>{n.message}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{formatDate(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
