import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../@/components/ui/select";
import { Label } from "../@/components/ui/label";
import { getActualTeamPoints, getWeekTotal } from "./lib/utils";
import type { Entry, LeagueData, Player, Team } from "./lib/LeagueDataTypes";

const LEAGUE_ID = "1525510";
const SEASON = 2024;
const SEGMENT_ID = 0; // Regular season
type PositionId = 1 | 2 | 4 | 6 | 23 | 5 | 16;

// const POSITION_MAP: { [key: number]: string } = {
//   1: "QB",
//   2: "RB",
//   4: "WR",
//   6: "TE",
//   23: "FLEX",
//   5: "K",
//   16: "D/ST",
// };

const POSITION_NAMES: Record<number, string> = {
  1: "QB",
  2: "RB",
  4: "WR",
  6: "TE",
  16: "D/ST",
  5: "K",
  23: "FLEX",
};

const getTruePosition = (player: Player): number => {
  const slots = player.eligibleSlots;

  if (slots.includes(23)) {
    if (slots.includes(2)) {
      return 2; // RB
    }
    if (slots.includes(4)) {
      return 4; // WR
    }
    return 6; // TE
  }
  return player.defaultPositionId;
};

export default function TeamLineupViewer() {
  // interface Team {
  //   id: number;
  //   location: string;
  //   nickname: string;
  //   roster: {
  //     entries: {
  //       playerPoolEntry: {
  //         player: {
  //           fullName: string;
  //           defaultPositionId: number;
  //           playerId: number;
  //           stats: {
  //             scoringPeriodId: number;
  //             statSourceId: number;
  //             appliedTotal?: number;
  //           }[];
  //         };
  //       };
  //     }[];
  //   };
  // }

  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1); // Default to Week 1
  const [optimalLineup, setOptimalLineup] = useState<Player[]>([]);
  const [actualPoints, setActualPoints] = useState<number>(0);
  const [optimalPoints, setOptimalPoints] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeagueData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${SEASON}/segments/${SEGMENT_ID}/leagues/${LEAGUE_ID}?view=mMatchup&view=mMatchupScore&view=mTeam&scoringPeriodId=${selectedWeek}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch league data");
        }

        const data = await response.json();
        setLeagueData(data);
      } catch (error) {
        console.error("Error loading league data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueData();
  }, [selectedWeek]);

  useEffect(() => {
    if (!leagueData || !selectedTeamId) return;

    const team = leagueData.teams.find((t: Team) => t.name === selectedTeamId);

    const teamScore = getActualTeamPoints(
      leagueData,
      team?.id ?? 0,
      selectedWeek
    );
    setActualPoints(teamScore);
    console.log("Actual Points:", teamScore);
    if (!team) {
      setOptimalLineup([]);
      return;
    }
    const rosterEntries = team?.roster?.entries ?? [];
    const players: Player[] = (rosterEntries as Entry[]).map((entry) => {
      const player = entry.playerPoolEntry.player;
      const truePosition = getTruePosition(player);
      player.defaultPositionId = truePosition;
      return player;
    });

    const lineup = getOptimalLineup(players);
    setOptimalLineup(lineup);

    const optimalPoints = getWeekTotal(lineup, selectedWeek);
    console.log("Optimal Points:", optimalPoints);

    setOptimalPoints(optimalPoints);
  }, [leagueData, selectedTeamId, selectedWeek]);

  const getOptimalLineup = (players: Player[]): Player[] => {
    const POS_LIMITS: Record<PositionId, number> = {
      1: 1,
      2: 2,
      4: 2,
      5: 1,
      6: 1,
      23: 1,
    };

    const FLEX_ELIGIBLE = [2, 4, 6]; // RB, WR, TE
    const lineup: Player[] = [];
    const counts: { [positionId: number]: number } = {};
    const usedPlayers: Set<number> = new Set();

    let copiedPlayers = [...players];

    // Get the QBs and add the highest scoring one
    const qbs = copiedPlayers.filter((p) => p.defaultPositionId === 1);
    if (qbs.length > 0) {
      const bestQB = qbs.reduce((prev, curr) => {
        const prevPoints =
          prev.stats.find((s) => s.scoringPeriodId === selectedWeek)
            ?.appliedTotal ?? 0;
        const currPoints =
          curr.stats.find((s) => s.scoringPeriodId === selectedWeek)
            ?.appliedTotal ?? 0;

        return prevPoints > currPoints ? prev : curr;
      });
      lineup.push(bestQB);
      usedPlayers.add(bestQB.id);
      counts[0] = (counts[0] || 0) + 1;
      copiedPlayers = copiedPlayers.filter((p) => p.id !== bestQB.id);
    }

    const rbs = copiedPlayers.filter((p) => p.defaultPositionId === 2);
    if (rbs.length > 0) {
      const sortedRbs = rbs.sort((a, b) => {
        const aPoints =
          a.stats.find(
            (s) =>
              s.scoringPeriodId === selectedWeek &&
              s.statSourceId === 0 &&
              s.statSplitTypeId === 1
          )?.appliedTotal ?? 0;
        const bPoints =
          b.stats.find(
            (s) =>
              s.scoringPeriodId === selectedWeek &&
              s.statSourceId === 0 &&
              s.statSplitTypeId === 1
          )?.appliedTotal ?? 0;
        return bPoints - aPoints;
      });
      console.log("Sorted RBs:", sortedRbs);
      for (let i = 0; i < Math.min(2, sortedRbs.length); i++) {
        const rb = sortedRbs[i];
        lineup.push(rb);
        usedPlayers.add(rb.id);
        counts[2] = (counts[2] || 0) + 1;
        copiedPlayers = copiedPlayers.filter((p) => p.id !== rb.id);
      }
    }

    const wrs = copiedPlayers.filter((p) => p.defaultPositionId === 4);
    if (wrs.length > 0) {
      const sortedWrs = wrs.sort((a, b) => {
        const aPoints =
          a.stats.find(
            (s) =>
              s.scoringPeriodId === selectedWeek &&
              s.statSourceId === 0 &&
              s.statSplitTypeId === 1
          )?.appliedTotal ?? 0;
        const bPoints =
          b.stats.find(
            (s) =>
              s.scoringPeriodId === selectedWeek &&
              s.statSourceId === 0 &&
              s.statSplitTypeId === 1
          )?.appliedTotal ?? 0;
        return bPoints - aPoints;
      });
      for (let i = 0; i < Math.min(2, sortedWrs.length); i++) {
        const wr = sortedWrs[i];
        lineup.push(wr);
        usedPlayers.add(wr.id);
        counts[4] = (counts[4] || 0) + 1;
        copiedPlayers = copiedPlayers.filter((p) => p.id !== wr.id);
      }
    }

    const tes = copiedPlayers.filter((p) => p.defaultPositionId === 6);
    if (tes.length > 0) {
      const sortedTes = tes.sort((a, b) => {
        const aPoints =
          a.stats.find(
            (s) =>
              s.scoringPeriodId === selectedWeek &&
              s.statSourceId === 0 &&
              s.statSplitTypeId === 1
          )?.appliedTotal ?? 0;
        const bPoints =
          b.stats.find(
            (s) =>
              s.scoringPeriodId === selectedWeek &&
              s.statSourceId === 0 &&
              s.statSplitTypeId === 1
          )?.appliedTotal ?? 0;
        return bPoints - aPoints;
      });
      const bestTE = sortedTes[0];
      lineup.push(bestTE);
      usedPlayers.add(bestTE.id);
      counts[6] = (counts[6] || 0) + 1;
      copiedPlayers = copiedPlayers.filter((p) => p.id !== bestTE.id);
    }

    const dsts = copiedPlayers.filter((p) => p.defaultPositionId === 16);
    if (dsts.length > 0) {
      const bestDST = dsts.reduce((prev, curr) => {
        const prevPoints =
          prev.stats.find(
            (s) =>
              s.scoringPeriodId === selectedWeek &&
              s.statSourceId === 0 &&
              s.statSplitTypeId === 1
          )?.appliedTotal ?? 0;
        const currPoints =
          curr.stats.find(
            (s) =>
              s.scoringPeriodId === selectedWeek &&
              s.statSourceId === 0 &&
              s.statSplitTypeId === 1
          )?.appliedTotal ?? 0;
        return prevPoints > currPoints ? prev : curr;
      });
      lineup.push(bestDST);
      usedPlayers.add(bestDST.id);
      counts[16] = (counts[16] || 0) + 1;
      copiedPlayers = copiedPlayers.filter((p) => p.id !== bestDST.id);
    }

    const k = copiedPlayers.filter((p) => p.defaultPositionId === 5);
    if (k.length > 0) {
      const bestK = k.reduce((prev, curr) => {
        const prevPoints =
          prev.stats.find(
            (s) =>
              s.scoringPeriodId === selectedWeek &&
              s.statSourceId === 0 &&
              s.statSplitTypeId === 1
          )?.appliedTotal ?? 0;
        const currPoints =
          curr.stats.find(
            (s) =>
              s.scoringPeriodId === selectedWeek &&
              s.statSourceId === 0 &&
              s.statSplitTypeId === 1
          )?.appliedTotal ?? 0;
        return prevPoints > currPoints ? prev : curr;
      });
      lineup.push(bestK);
      usedPlayers.add(bestK.id);
      counts[17] = (counts[17] || 0) + 1;
      copiedPlayers = copiedPlayers.filter((p) => p.id !== bestK.id);
    }

    // Add the highest remaining player to FLEX
    const flexCandidates = copiedPlayers.filter((p) =>
      FLEX_ELIGIBLE.includes(p.defaultPositionId)
    );
    if (flexCandidates.length > 0) {
      const bestFlex = flexCandidates.reduce((prev, curr) => {
        const prevPoints =
          prev.stats.find(
            (s) =>
              s.scoringPeriodId === selectedWeek &&
              s.statSourceId === 0 &&
              s.statSplitTypeId === 1
          )?.appliedTotal ?? 0;
        const currPoints =
          curr.stats.find(
            (s) =>
              s.scoringPeriodId === selectedWeek &&
              s.statSourceId === 0 &&
              s.statSplitTypeId === 1
          )?.appliedTotal ?? 0;
        return prevPoints > currPoints ? prev : curr;
      });
      lineup.push(bestFlex);
      usedPlayers.add(bestFlex.id);
      counts[23] = (counts[23] || 0) + 1;
    }

    console.log(
      "Optimal lineup: ",
      lineup.map((p) => p.fullName)
    );
    return lineup;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Optimal Fantasy Lineup</h1>
      {leagueData && (
        <div className="flex justify-center space-x-4 mb-6">
          <Select
            onValueChange={(id) => setSelectedTeamId(id)}
            value={selectedTeamId ?? ""}
          >
            <SelectTrigger className="w-[300px] bg-white text-black dark:bg-white dark:text-black border border-gray-300">
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black dark:text-black border border-gray-300 z-[9999]">
              {leagueData.teams.map((team: Team) => {
                return (
                  <SelectItem
                    key={team.id}
                    value={String(team.name)}
                    className="text-black text-base focus:bg-gray-100 data-[highlighted]:bg-gray-100 data-[highlighted]:text-black cursor-pointer"
                  >
                    {team.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select onValueChange={(week) => setSelectedWeek(Number(week))}>
            <SelectTrigger className="w-[150px] bg-white text-black dark:bg-white dark:text-black border border-gray-300">
              <SelectValue placeholder="Select Week" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black dark:text-black border border-gray-300 z-[9999]">
              {[...Array(18)].map((_, i) => {
                const weekNum = i + 1;
                return (
                  <SelectItem key={weekNum} value={weekNum.toString()}>
                    Week {weekNum}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}
      {optimalLineup.length > 0 && (
        <div className="text-lg mt-2">
          <Label className="inline-block w-fit rounded-md px3 py-1 p-2 text-center text-lg font-medium bg-[#F2E8CF]">
            Optimal Score: {optimalPoints.toFixed(2)}
          </Label>
          <br />
          <Label className="inline-block w-fit rounded-md px3 py-1 m-2 p-2 text-center text-lg font-medium bg-[#BC4749]">
            You left {(optimalPoints - actualPoints).toFixed(2)} points on the
            bench!
          </Label>
        </div>
      )}
      {optimalLineup.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {optimalLineup.map((player, idx) => {
            return (
              <Card key={idx} className="bg-[#6A994E]">
                <CardContent className="p-4 ">
                  <div className="font-semibold">
                    {POSITION_NAMES[player.defaultPositionId] || "Position"}
                  </div>
                  <div>{player.fullName}</div>
                  <div className="text-sm text-muted">
                    {player.stats.find(
                      (s) =>
                        s.scoringPeriodId === selectedWeek &&
                        s.statSourceId === 0 &&
                        s.statSplitTypeId === 1
                    )?.appliedTotal ?? 0}{" "}
                    pts
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
