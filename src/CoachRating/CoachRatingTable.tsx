import React from "react";
import type { TeamCoachRatings } from "./CoachRatingTypes";

interface CoachRatingsTableProps {
  ratings: TeamCoachRatings[];
}

export const CoachRatingsTable: React.FC<CoachRatingsTableProps> = ({
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
              Power Rating ⚡
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50 bg-slate-900/50">
          {ratings.map((team, idx) => (
            <tr key={idx} className="hover:bg-slate-800/70 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-slate-200">
                {team.teamName}
              </td>
              <td className="px-4 py-3 text-sm text-right font-mono font-bold text-emerald-300">
                {team.rating.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
