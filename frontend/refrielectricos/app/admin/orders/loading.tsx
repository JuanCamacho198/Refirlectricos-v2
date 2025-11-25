import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminOrdersLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Skeleton className="h-8 w-32" />

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Skeleton className="h-6 w-full" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 flex gap-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
        
        {/* Table Rows */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-6">
              {/* Order ID */}
              <Skeleton className="h-4 w-20" />
              {/* User email */}
              <Skeleton className="h-4 w-40" />
              {/* Date */}
              <Skeleton className="h-4 w-24" />
              {/* Total */}
              <Skeleton className="h-4 w-20" />
              {/* Status badge */}
              <Skeleton className="h-6 w-24 rounded-full" />
              {/* Actions */}
              <Skeleton className="h-6 w-6 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
