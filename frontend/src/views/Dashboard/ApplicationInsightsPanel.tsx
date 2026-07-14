import { useQuery } from "@tanstack/react-query";
import { fetchInsights } from "../../api/ai";
import { getErrorMessage } from "../../lib/errors";
import { Spinner } from "../../components/Spinner";

export function ApplicationInsightsPanel() {
  const {
    data: insights,
    isFetching: insightsFetching,
    isError: insightsIsError,
    error: insightsError,
    refetch: refetchInsights,
  } = useQuery({
    queryKey: ["ai", "insights"],
    queryFn: fetchInsights,
    enabled: false,
    retry: false,
  });

  return (
    <div className="mb-8 rounded-lg border border-orange-100 bg-orange-50 p-5 shadow-sm dark:border-orange-900 dark:bg-orange-950">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium text-orange-900 dark:text-orange-200">Application insights</h2>
        <button
          onClick={() => refetchInsights()}
          disabled={insightsFetching}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 hover:underline disabled:opacity-50 dark:text-orange-300"
        >
          {insightsFetching && <Spinner className="h-3.5 w-3.5" />}
          {insightsFetching ? "Analyzing..." : insights ? "Re-analyze" : "Analyze my applications"}
        </button>
      </div>

      {!insights && !insightsFetching && (
        <p className="text-sm text-orange-800 dark:text-orange-300">
          Click "Analyze my applications" to get AI-generated insights from your data.
        </p>
      )}
      {!insights && insightsFetching && (
        <div className="flex items-center gap-2 text-sm text-orange-800 dark:text-orange-300">
          <Spinner className="h-4 w-4" />
          Analyzing your applications... this can take up to a minute on the free AI tier.
        </div>
      )}
      {insightsIsError && <p className="text-sm text-red-600 dark:text-red-400">{getErrorMessage(insightsError)}</p>}
      {insights && (
        <>
          <p className="text-sm text-orange-900 dark:text-orange-100">{insights.insight}</p>
          {insights.stats.categoryStats.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {insights.stats.categoryStats.map((c) => (
                <span
                  key={c.category}
                  className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                >
                  {c.category}: {c.responseRate}% response ({c.total})
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
