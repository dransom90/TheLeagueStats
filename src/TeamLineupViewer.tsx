import { useEffect, useState } from "react";
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
import { getOptimalLineup } from "./lib/OptimalLineupCalculator";

const LEAGUE_ID = "1525510";
const SEGMENT_ID = 0; // Regular season

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

export default function TeamLineupViewer({ year }: { year: number }) {
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1); // Default to Week 1
  const [optimalLineup, setOptimalLineup] = useState<Player[]>([]);
  const [actualPoints, setActualPoints] = useState<number>(0);
  const [optimalPoints, setOptimalPoints] = useState<number>(0);
  //const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeagueData = async () => {
      //setLoading(true);
      try {
        const response = await fetch(
          `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${year}/segments/${SEGMENT_ID}/leagues/${LEAGUE_ID}?view=mMatchup&view=mMatchupScore&view=mTeam&scoringPeriodId=${selectedWeek}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch league data");
        }

        const data = await response.json();
        setLeagueData(data);
      } catch (error) {
        console.error("Error loading league data:", error);
      } finally {
        //setLoading(false);
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

    const lineup = getOptimalLineup(players, selectedWeek);
    setOptimalLineup(lineup);

    const optimalPoints = getWeekTotal(lineup, selectedWeek);
    console.log("Optimal Points:", optimalPoints);

    setOptimalPoints(optimalPoints);
  }, [leagueData, selectedTeamId, selectedWeek]);

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
