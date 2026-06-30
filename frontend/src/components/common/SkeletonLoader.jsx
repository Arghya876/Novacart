import React from 'react';

export default function SkeletonLoader({ type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="flex flex-col gap-4 p-4 rounded-2xl border border-neutral-150 dark:border-neutral-850 animate-pulse bg-white dark:bg-neutral-900">
        <div className="w-full aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-5 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="flex justify-between items-center mt-2">
          <div className="h-6 w-1/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
        </div>
      </div>
    );
  }

  if (type === 'details') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 animate-pulse">
        <div className="w-full aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
        <div className="space-y-6">
          <div className="h-4 w-1/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-8 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-6 w-1/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-20 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-10 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
        </div>
      </div>
    );
  }

  return null;
}
