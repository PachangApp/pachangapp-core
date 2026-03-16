import React from "react";

const StatCard = ({ label, value, icon, color = "emerald" }) => {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100",
    blue: "bg-blue-50 text-blue-600 shadow-blue-100",
    amber: "bg-amber-50 text-amber-600 shadow-amber-100",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-black text-gray-900">{value}</div>
          <div className="text-sm text-gray-500 font-medium">{label}</div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
