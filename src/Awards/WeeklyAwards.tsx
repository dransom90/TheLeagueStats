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
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "../../@/components/ui/card";
import type { LeagueData } from "../lib/LeagueDataTypes";
import { getWeeksPlayed } from "../lib/utils";

interface AwardProps {
  selectedYear: number;
}
export default function WeeklyAwards({ selectedYear }: AwardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeksPlayed, setWeeksPlayed] = useState<number>(0);

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
        const weeksPlayed = getWeeksPlayed(leagueData);

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
      <Accordion type="single" collapsible>
        <AccordionItem value="weekly-awards-intro">
          <AccordionTrigger className="text-lg font-bold">
            Weekly Awards – What’s This?
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-lg leading-relaxed mb-3">
              This is where the{" "}
              <span className="font-bold text-green-600">bragging rights</span>{" "}
              🏆 and{" "}
              <span className="font-bold text-amber-400">
                walk-of-shame moments
              </span>{" "}
              😳 get immortalized:
            </p>
            <ul className="text-lg leading-relaxed space-y-2 list-none">
              <li>
                🏆{" "}
                <span className="font-bold text-green-400">Highest score:</span>{" "}
                You’re the
                <span className="italic text-green-300"> alpha</span> 🐺
              </li>
              <li>
                😳{" "}
                <span className="font-bold text-amber-400">Lowest score:</span>{" "}
                Better start making excuses 🙈
              </li>
              <li>
                💡{" "}
                <span className="font-bold text-green-400">
                  Perfect lineup:
                </span>{" "}
                We salute your
                <span className="italic text-green-300"> genius</span>
              </li>
              <li>
                🪦{" "}
                <span className="font-bold text-amber-400">
                  Points rotting on the bench:
                </span>
                We’ll never let you forget it
              </li>
              <li>
                💥{" "}
                <span className="font-bold text-green-400">
                  Blowout victories
                </span>{" "}
                ✅
              </li>
              <li>
                😬{" "}
                <span className="font-bold text-amber-400">
                  Nail-biter escapes
                </span>{" "}
                ❌
              </li>
              <li>
                🤔{" "}
                <span className="italic text-green-300">
                  “How did you barely win with that?”
                </span>
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
