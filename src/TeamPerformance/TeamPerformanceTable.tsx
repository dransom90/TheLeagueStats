import React from "react";
import type { TeamPerformanceResult } from "./TeamPerformanceTypes";

interface TeamPerformanceTableProps {
  ratings: TeamPerformanceResult[];
}

export const TeamPerformanceTable: React.FC<TeamPerformanceTableProps> = ({
  ratings,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 overflow-x-auto">
      <table className="w-full border-collapse rounded-lg shadow-lg overflow-hidden">
        <thead className="bg-emerald-700/80">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold text-slate-100">
              Team
            </th>
            <th className="px-4 py-2 text-right text-sm font-semibold text-slate-100">
              Expected Wins
            </th>
            <th className="px-4 py-2 text-right text-sm font-semibold text-slate-100">
              Actual Wins
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50 bg-slate-900/50">
          {ratings.map((rating, idx) => (
            <tr key={idx} className="hover:bg-slate-800/70 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-slate-200">
                {rating.teamName}
              </td>
              <td className="px-4 py-3 text-sm text-right font-mono font-bold text-emerald-300">
                {rating.expectedWins.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-right font-mono font-bold text-emerald-300">
                {rating.actualWins.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
