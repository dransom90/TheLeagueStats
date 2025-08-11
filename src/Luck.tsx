import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../@/components/ui/table";
import type { LeagueData } from "./lib/LeagueDataTypes";
import { calculateLuckPoints } from "./Luck/LuckUtils";
import type { LuckPoints } from "./Luck/LuckTypes";
import { Badge } from "../@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../@/components/ui/tabs";

interface LuckProps {
  selectedYear: number;
}

export default function Luck({ selectedYear }: LuckProps) {
  //const [schedule, setSchedule] = useState<Matchup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [sortedPoints, setSortedPoints] = useState<
  //   {
  //     week: number;
  //     teams: { teamId: number; name: string; points: number }[];
  //   }[]
  // >([]);
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [luckData, setLuckData] = useState<LuckPoints[]>([]);
  const [weeksPlayed, setWeeksPlayed] = useState<number>(0);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        // Replace this with your API endpoint for ESPN league data
        const res = await fetch(
          `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${selectedYear}/segments/0/leagues/1525510?view=mMatchup&view=mMatchupScore&view=mTeam&scoringPeriodId`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const leagueData: LeagueData = await res.json();
        setLeagueData(leagueData);

        if (!leagueData.schedule) {
          throw new Error("No schedule data found in API response");
        }

        const luckData = calculateLuckPoints(leagueData);
        const weeksPlayed = Math.max(
          ...leagueData.schedule.map((m) => m.matchupPeriodId)
        );
        setLuckData(luckData);
        setWeeksPlayed(weeksPlayed);

        //setSchedule(leagueData.schedule);
        //setSortedPoints(getWeeklyPointsSorted(leagueData));
      } catch (err: any) {
        setError(err.message || "Failed to fetch schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedYear]);

  if (loading) {
    return <div>Loading matchups...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const weeklyRows = [];
  for (let week = 1; week <= weeksPlayed; week++) {
    const weekData = luckData.map((t) => {
      const weekInfo = t.weekly.find((w) => w.week === week);
      return {
        teamName: t.teamName,
        points: weekInfo?.points ?? 0,
        won: weekInfo?.won ?? false,
        luck: weekInfo?.luck ?? 0,
      };
    });

    weekData.sort((a, b) => b.points - a.points);
    weeklyRows.push({ week, teams: weekData });
  }

  const seasonData = [...luckData].sort((a, b) => b.totalLuck - a.totalLuck);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Luck Analysis</h2>
      <h3>
        Deep down we all know that this is a game of luck but how does one
        quantify "Luck?"
      </h3>
      <br />
      <h3>
        Luck is hereby defined by how well your team performs compared to the
        rest of The League. If your team is the worst, then you have 0 “Luck”
        and a complete lack of “Skill.” The highest scoring team has 0 “Luck”
        and a lot of “Skill.”
      </h3>
      <br />
      <h3>
        If your team scores the second to lowest amount of points but still
        wins, you experience a lot of “Good Luck.” If you lost, you experienced
        a little bit of “Bad Luck.” Of course, the opposite is true for the
        second highest scoring team.
      </h3>
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Luck</TabsTrigger>
          <TabsTrigger value="season">Season Luck</TabsTrigger>
        </TabsList>

        {/* Weekly Luck Table */}
        <TabsContent value="weekly">
          <Accordion type="single" collapsible className="w-full">
            {Array.from({ length: weeksPlayed }, (_, i) => {
              const weekNum = i + 1;

              // Build week data by mapping teams' weekly data
              const weekData = luckData.map((t) => {
                const weekInfo = t.weekly.find((w) => w.week === weekNum);
                return {
                  teamId: t.teamId,
                  teamName: t.teamName,
                  points: weekInfo?.points ?? 0,
                  won: weekInfo?.won ?? false,
                  luck: weekInfo?.luck ?? 0,
                };
              });

              // Sort by points scored (highest first)
              weekData.sort((a, b) => b.luck - a.luck);

              return (
                <AccordionItem key={weekNum} value={`week-${weekNum}`}>
                  <AccordionTrigger>Week {weekNum}</AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Team</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Won</TableHead>
                          <TableHead>Luck</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {weekData.map((t) => (
                          <TableRow key={t.teamId}>
                            <TableCell>{t.teamName}</TableCell>
                            <TableCell>{t.points}</TableCell>
                            <TableCell>{t.won ? "✅" : "❌"}</TableCell>
                            <TableCell>{t.luck}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </TabsContent>

        {/* Season Luck Table */}
        <TabsContent value="season">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Season Luck Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead className="w-auto">Team</TableHead>
                    <TableHead>Total Luck</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seasonData.map((t, idx) => (
                    <TableRow key={t.teamId}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{t.teamName}</TableCell>
                      <TableCell
                        className={
                          t.totalLuck > 0
                            ? "text-green-600"
                            : t.totalLuck < 0
                            ? "text-red-600"
                            : ""
                        }
                      >
                        {t.totalLuck}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
