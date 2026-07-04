import React from 'react';

export default function EmptyState() {
  return (
    <div className="flex-1 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col items-center justify-center p-6 text-center min-h-[500px]">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-wide text-[#6B7280]/40 select-none font-sans">
        Start Messaging
      </h2>
      <p className="text-xs text-[#6B7280] mt-2 max-w-xs">
        Select a travel group channel from the left menu workspace panel to open your communications feed.
      </p>
    </div>
  );
}