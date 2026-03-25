import React, { useState } from "react";

const QuickFilters = ({ filters = ["Hoy", "Mañana", "F-Sala", "F-7", "F-11", "Cerca de mí"] }) => {
  const [activeFilter, setActiveFilter] = useState("Hoy");

  return (
    <section className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-2 snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
      {filters.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`shrink-0 px-5 py-2 rounded-full border text-sm font-semibold snap-center transition-all ${
              isActive
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                : "bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:border-emerald-200"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </section>
  );
};

export default QuickFilters;
