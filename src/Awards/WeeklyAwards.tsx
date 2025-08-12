/*
The Golden Turd is awarded to the team that posts the lowest score each week.
The Juggernaut is awarded to the team that posts the highest score each week.
The Bill Belichick is awarded to the Best Managed Team. This is the team that leaves the fewest points on the bench.
The Rod Marinelli is awarded to the Worst Managed Team of the week. This is the team that leaves the most points on the bench.
The Kurt Warner is awarded to the team that has the highest scoring potential.
The Ryan Leaf is awarded to the team that has the lowest scoring potential.
The Patriot is awarded to the team that has the highest margin of victory. For more information on this award, visit https://en.wikipedia.org/wiki/1916_Cumberland_vs._Georgia_Tech_football_game 
The Barn Burner is award to the team that has the smallest margin of victory.

If you have an idea for more awards or think that you have a better name for an existing award, I may be open to suggestions, for the right price

*/
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../@/components/ui/card";
import type { LeagueData } from "../lib/LeagueDataTypes";

interface AwardProps {
  selectedYear: number;
}
export default function WeeklyAwards({ selectedYear }: AwardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("calling api endpoint");
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
      } catch (err: any) {
        setError(err.message || "Failed to fetch schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedYear]);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            🏆 Weekly Awards — Where Legends and Laughingstocks Are Made
          </CardTitle>
        </CardHeader>
        <CardDescription>
          <p className="text-lg leading-relaxed">
            This is where the{" "}
            <span className="font-bold text-green-600">bragging rights</span> 🏆
            and{" "}
            <span className="font-bold text-red-600">
              walk-of-shame moments
            </span>{" "}
            😳 get immortalized.{" "}
            <span className="font-bold text-green-600">
              Highest score of the week?
            </span>{" "}
            You’re the <span className="italic text-green-500">alpha</span> 🐺.{" "}
            <span className="font-bold text-red-600">Lowest score?</span> Better
            start making excuses 🙈.{" "}
            <span className="font-bold text-green-600">
              Nailed the perfect lineup?
            </span>{" "}
            We salute your <span className="italic text-green-500">genius</span>{" "}
            💡. Left half your points{" "}
            <span className="font-bold text-red-600">
              rotting on the bench?
            </span>{" "}
            We’ll never let you forget it 🪦. From{" "}
            <span className="font-bold text-green-600">blowout victories</span>{" "}
            💥 to{" "}
            <span className="font-bold text-red-600">nail-biter escapes</span>{" "}
            😬 — and even the{" "}
            <span className="italic text-green-500">
              “how did you barely win with that?”
            </span>{" "}
            moments — the{" "}
            <span className="font-bold text-green-600">Weekly Awards</span> call
            out every <span className="text-green-600">triumph</span> ✅ and{" "}
            <span className="text-red-600">tragedy</span> ❌.
          </p>
        </CardDescription>
      </Card>
    </div>
  );
}
