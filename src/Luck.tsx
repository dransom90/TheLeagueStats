import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../@/components/ui/table";
import type { LeagueData } from "./lib/LeagueDataTypes";
import { calculateLuckPoints } from "./Luck/LuckUtils";
import type { LuckPoints } from "./Luck/LuckTypes";
import { getWeeksPlayed } from "./lib/utils";
//import { Badge } from "../@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../@/components/ui/tabs";
import Loading from "./Loading";

interface LuckProps {
  selectedYear: number;
}

export default function Luck({ selectedYear }: LuckProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [luckData, setLuckData] = useState<LuckPoints[]>([]);
  const [weeksPlayed, setWeeksPlayed] = useState<number>(0);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${selectedYear}/segments/0/leagues/1525510?view=mMatchup&view=mMatchupScore&view=mTeam&scoringPeriodId`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const leagueData: LeagueData = await res.json();

        if (!leagueData.schedule) {
          throw new Error("No schedule data found in API response");
        }

        const luckData = calculateLuckPoints(leagueData);
        const weeksPlayed = getWeeksPlayed(leagueData);

        setLuckData(luckData);
        setWeeksPlayed(weeksPlayed);
      } catch (err: any) {
        setError(err.message || "Failed to fetch schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedYear]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-amber-400">Error: {error}</div>;
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
      <Accordion type="single" collapsible className="w-full mb-4">
        <AccordionItem value="what-is-luck">
          <Card className="w-full focus:outline-none focus:ring-0">
            <AccordionTrigger>
              <CardHeader className="w-full space-y-1">
                <CardTitle>
                  Luck: The Stat That Calls Out Pure Fantasy Fortune
                </CardTitle>
                <CardDescription className="w-full text-slate-100 max-w-none">
                  In fantasy football some wins are earned, others are{" "}
                  <em>stolen</em> by the fantasy gods. This page keeps receipts.
                </CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-4">
                <p className="leading-relaxed text-left">
                  <strong>“Luck”</strong> measures how much your weekly result
                  matched up with how well you actually scored compared to the
                  rest of the league. Win while putting up weak numbers?
                  Congrats — you just banked
                  <span className="text-green-600"> Good Luck Points</span>.
                  Drop 140 and still lose? Sorry — that’s
                  <span className="text-amber-400"> Bad Luck Points</span>.
                </p>

                <div>
                  <h2 className="text-base font-semibold mb-2">
                    How the points work
                  </h2>
                  <ul className="list-disc list-outside space-y-1 text-left">
                    <li>
                      <strong>Positive Luck Points</strong> — awarded when you{" "}
                      <em>win</em> despite scoring fewer points than many other
                      teams that week (you got lucky).
                    </li>
                    <li>
                      <strong>Negative Luck Points</strong> — given when you{" "}
                      <em>lose</em> despite outscoring many teams that week (you
                      were unlucky).
                    </li>
                    <li>
                      Rank-based scoring: the farther from the top (for winners)
                      or the bottom (for losers) your rank is, the bigger the
                      swing — up to <strong>±10 points</strong> in a single
                      week.
                    </li>
                    <li>
                      The top-scoring team and the lowest-scoring team both get{" "}
                      <strong>0 luck</strong> for that week (they either
                      demonstrated clear skill or were unambiguously worst).
                    </li>
                  </ul>
                </div>

                <p className="text-slate-100">
                  Check the <strong>Weekly Luck</strong> tab to relive every
                  theft and injustice. Flip to{" "}
                  <strong>Season Luck Totals</strong> to see who’s been riding
                  the horseshoe all year — and who’s been cursed for life.
                </p>

                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 rounded-full px-2 py-0.5 text-xs text-slate-800">
                    Tip
                  </span>
                  <small className="text-slate-100">
                    Use this stat to fuel the trash talk — or to spot which of
                    your victories were actually miracles.
                  </small>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
      <br />
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="weekly">Weekly Luck</TabsTrigger>
          <TabsTrigger className="m-4" value="season">
            Season Luck
          </TabsTrigger>
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
                          <TableHead className="text-center px-2 py-1 font-bold">
                            Team
                          </TableHead>
                          <TableHead className="text-center px-2 py-1 font-bold">
                            Points
                          </TableHead>
                          <TableHead className="text-center px-2 py-1 font-bold">
                            Won
                          </TableHead>
                          <TableHead className="text-center px-2 py-1 font-bold">
                            Luck
                          </TableHead>
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
                    <TableHead className="text-center px-2 py-1 font-bold">
                      Rank
                    </TableHead>
                    <TableHead className="text-center px-2 py-1 font-bold">
                      Team
                    </TableHead>
                    <TableHead className="text-center px-2 py-1 font-bold">
                      Total Luck
                    </TableHead>
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
                            ? "text-amber-400"
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
