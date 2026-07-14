import type { ApplicationStatus } from "../../types";
import { STATUS_LABELS, STATUS_ORDER } from "../../lib/statusColors";

interface ApplicationFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: ApplicationStatus | "";
  onStatusFilterChange: (value: ApplicationStatus | "") => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  searchTooShort: boolean;
}

export function ApplicationFiltersBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  hasActiveFilters,
  onClearFilters,
  searchTooShort,
}: ApplicationFiltersBarProps) {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search company or position..."
          className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-orange-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as ApplicationStatus | "")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-orange-400"
        >
          <option value="">All statuses</option>
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Clear filters
          </button>
        )}
      </div>

      {searchTooShort && (
        <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">
          Type at least 3 characters to search.
        </p>
      )}
    </>
  );
}
