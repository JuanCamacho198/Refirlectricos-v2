export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 h-12 w-12"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-[400px]">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-md mb-6"></div>
          <div className="h-[300px] bg-gray-100 dark:bg-gray-700/50 rounded-lg"></div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-[400px]">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-md mb-6"></div>
          <div className="h-[300px] bg-gray-100 dark:bg-gray-700/50 rounded-full mx-auto w-[300px]"></div>
        </div>
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-[400px]">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                  </div>
                </div>
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-[400px]">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-md mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
