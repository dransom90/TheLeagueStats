import React, { useState } from "react";
import type { TeamPerformanceResult } from "./TeamPerformanceTypes";

interface TeamPerformanceTableProps {
  ratings: TeamPerformanceResult[];
}

type SortKey = keyof TeamPerformanceResult;

export const TeamPerformanceTable: React.FC<TeamPerformanceTableProps> = ({
  ratings,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>("teamName");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc); // toggle direction
    } else {
      setSortKey(key);
      setSortAsc(true); // reset to ascending on new key
    }
  };

  const sortedRatings = [...ratings].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];

    if (typeof valA === "number" && typeof valB === "number") {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const renderSortIndicator = (key: SortKey) => {
    if (key !== sortKey) return null;
    return sortAsc ? " ▲" : " ▼";
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 overflow-x-auto">
      <table className="w-full border-collapse rounded-lg shadow-lg overflow-hidden">
        <thead className="bg-emerald-700/80">
          <tr>
            <th
              className="px-4 py-2 text-left text-sm font-semibold text-slate-100 cursor-pointer select-none"
              onClick={() => handleSort("teamName")}
            >
              Team{renderSortIndicator("teamName")}
            </th>
            <th
              className="px-4 py-2 text-right text-sm font-semibold text-slate-100 cursor-pointer select-none"
              onClick={() => handleSort("expectedWins")}
            >
              Expected Wins{renderSortIndicator("expectedWins")}
            </th>
            <th
              className="px-4 py-2 text-right text-sm font-semibold text-slate-100 cursor-pointer select-none"
              onClick={() => handleSort("actualWins")}
            >
              Actual Wins{renderSortIndicator("actualWins")}
            </th>
            <th
              className="px-4 py-2 text-right text-sm font-semibold text-slate-100 cursor-pointer select-none"
              onClick={() => handleSort("expectedRank")}
            >
              Expected Rank{renderSortIndicator("expectedRank")}
            </th>
            <th
              className="px-4 py-2 text-right text-sm font-semibold text-slate-100 cursor-pointer select-none"
              onClick={() => handleSort("actualRank")}
            >
              Actual Rank{renderSortIndicator("actualRank")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50 bg-slate-900/50">
          {sortedRatings.map((rating, idx) => (
            <tr key={idx} className="hover:bg-slate-800/70 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-slate-200">
                {rating.teamName}
              </td>
              <td className="px-4 py-3 text-sm text-right font-mono font-bold text-emerald-300">
                {rating.expectedWins.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-right font-mono font-bold text-emerald-300">
                {rating.actualWins}
              </td>
              <td className="px-4 py-3 text-sm text-right font-mono font-bold text-emerald-300">
                {rating.expectedRank}
              </td>
              <td className="px-4 py-3 text-sm text-right font-mono font-bold text-emerald-300">
                {rating.actualRank}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
