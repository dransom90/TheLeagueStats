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
  //CardDescription,
  CardHeader,
  CardTitle,
} from "../../@/components/ui/card";
import { getAllWeeklyAwards } from "./AwardUtils";
import type { WeekAwards } from "./AwardTypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../@/components/ui/select";
import { getWeeksPlayed } from "../lib/utils";

interface AwardProps {
  selectedYear: number;
}
export default function WeeklyAwards({ selectedYear }: AwardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeksPlayed, setWeeksPlayed] = useState<number>(0);
  const [awardData, setAwardData] = useState<WeekAwards[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  useEffect(() => {
    const fetchLeagueData = async () => {
      //setLoading(true);
      try {
        const response = await fetch(
          `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${selectedYear}/segments/0/leagues/1525510?view=mMatchup&view=mMatchupScore&view=mTeam&scoringPeriodId=${selectedWeek}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch league data");
        }

        const data = await response.json();
        const weeksPlayed = getWeeksPlayed(data);
        setAwardData(getAllWeeklyAwards(data, selectedWeek));
        setWeeksPlayed(weeksPlayed);
      } catch (error) {
        console.error("Error loading league data:", error);
      } finally {
        //setLoading(false);
      }
    };

    fetchLeagueData();
  }, [selectedYear, selectedWeek]);

  const weekData = awardData.find((w) => w.week === selectedWeek);
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

      {/* Week Selection*/}
      <div className="flex justify-center space-x-4 mb-6 mt-4">
        <Select onValueChange={(week) => setSelectedWeek(Number(week))}>
          <SelectTrigger className="w-[150px] bg-white text-black dark:bg-white dark:text-black border border-gray-300">
            <SelectValue placeholder="Select Week" />
          </SelectTrigger>
          <SelectContent className="bg-white text-black dark:text-black border border-gray-300 z-[9999]">
            {Array.from({ length: weeksPlayed }, (_, i) => {
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

      {/* Awards for the selected week */}
      {weekData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* The Juggernaut */}
          <Card className="bg-black">
            <CardHeader>
              <div className="relative group inline-block">
                <CardTitle className="font-semibold text-xl text-green-600  cursor-help">
                  🏆 The Juggernaut
                </CardTitle>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 rounded bg-black text-white text-xs p-2 text-center shadow-lg">
                  The Juggernaut — Pure offensive firepower. This award goes to
                  the team that lit up the scoreboard more than anyone else this
                  week, stacking points like they were playing Madden on rookie
                  mode. Win or lose, nobody came close to matching this fantasy
                  fireworks show.
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 ml-5 text-white">
                {weekData.highestScore.map((team, idx) => (
                  <div key={idx}>
                    <span className="font-medium text-lg block">
                      {team.teamName}
                    </span>
                    <span className="block">Scored {team.value} points</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* The Golden Turd */}
          <Card className="bg-black">
            <CardHeader>
              <div className="relative group inline-block">
                <CardTitle className="font-semibold text-xl text-amber-400 cursor-help">
                  💩 The Golden Turd
                </CardTitle>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 rounded bg-black text-white text-xs p-2 text-center shadow-lg">
                  The Golden Turd — A true masterpiece of mediocrity. This honor
                  is reserved for the team that managed to put up the fewest
                  points of the week, turning a fantasy matchup into a tragic
                  comedy. It’s not just losing — it’s losing with style.
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 ml-5 text-white">
                {weekData.lowestScore.map((team, idx) => (
                  <div key={idx}>
                    <span className="font-medium text-lg block">
                      {team.teamName}
                    </span>
                    <span className="block">Scored {team.value} points</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* The Bill Belichick */}
          <Card className="bg-black">
            <CardHeader>
              <div className="relative group inline-block">
                <CardTitle className="font-semibold text-xl text-amber-400 cursor-help">
                  🐐 The Bill Belichick
                </CardTitle>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 rounded bg-black text-white text-xs p-2 text-center shadow-lg">
                  The Bill Belichick — Either you’re a fantasy genius, or you
                  just blindly set your lineup and stumbled into perfection.
                  This award goes to the team that left almost nothing on the
                  bench… whether by masterful planning or sheer dumb luck, we’ll
                  never know.
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 ml-5 text-white">
                {weekData.bestManaged.map((team, idx) => (
                  <div key={idx}>
                    <span className="font-medium text-lg block">
                      {team.teamName}
                    </span>
                    <span className="block">
                      Left {team.value} points on the bench
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* The Rod Marinelli with tooltip */}
          <Card className="bg-black">
            <CardHeader>
              <div className="relative group inline-block">
                <CardTitle className="font-semibold text-xl text-amber-400 cursor-help">
                  🐑 The Rod Marinelli
                </CardTitle>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 rounded bg-black text-white text-xs p-2 text-center shadow-lg">
                  The Rod Marinelli – For the team that proved you can have all
                  the talent in the world… as long as it stays on the bench.
                  This honor goes to the coach who left the most points rotting
                  in reserve, watching helplessly as their starting lineup
                  sputtered. Sure, you could have won big — but hey, moral
                  victories count too, right? named after NFL coach Rod
                  Marinelli who went 0–16 in 2008.
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 ml-5 text-white">
                {weekData.worstManaged.map((team, idx) => (
                  <div key={idx}>
                    <span className="font-medium text-lg block">
                      {team.teamName}
                    </span>
                    <span className="block">
                      Left {team.value} points on the bench
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* The Patriot */}
          <Card className="bg-black">
            <CardHeader>
              <div className="relative group inline-block">
                <CardTitle className="font-semibold text-xl text-amber-400 cursor-help">
                  🥱 The Patriot
                </CardTitle>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 rounded bg-black text-white text-xs p-2 text-center shadow-lg">
                  The Patriot — Absolute domination. This award goes to the team
                  that didn’t just win — they crushed their opponent into
                  fantasy dust, posting the largest victory margin of the week.
                  It was less a game and more a public service announcement
                  about who’s in charge. Named after the biggest blowout in NFL
                  history (Google it...)
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 ml-5 text-white">
                {weekData.largestWin.map((team, idx) => (
                  <div key={idx}>
                    <span className="font-medium text-lg block">
                      {team.teamName}
                    </span>
                    <span className="block">
                      Won their matchup by {team.value} points
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* The Barn Burner */}
          <Card className="bg-black">
            <CardHeader>
              <div className="relative group inline-block">
                <CardTitle className="font-semibold text-xl text-amber-400 cursor-help">
                  🙈 The Barn Burner
                </CardTitle>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 rounded bg-black text-white text-xs p-2 text-center shadow-lg">
                  The Barn Burner — Forget blowouts, this was a nail-biter for
                  the ages. This award goes to the team that squeaked out a win
                  by the slimmest of margins, leaving their opponent (and
                  probably themselves) wondering what could have been if just
                  one more play went differently.
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 ml-5 text-white">
                {weekData.smallestWin.map((team, idx) => (
                  <div key={idx}>
                    <span className="font-medium text-lg block">
                      {team.teamName}
                    </span>
                    <span className="block">
                      Won their matchup by {team.value} points
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* The Kurt Warner */}
          <Card className="bg-black">
            <CardHeader>
              <div className="relative group inline-block">
                <CardTitle className="font-semibold text-xl text-green-500 cursor-help">
                  💡 The Kurt Warner
                </CardTitle>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 rounded bg-black text-white text-xs p-2 text-center shadow-lg">
                  The Kurt Warner — Like stocking your bench with MVPs, this
                  award goes to the team whose roster could have lit up the
                  scoreboard more than anyone else… if only the right players
                  had been started. A reminder that in fantasy football,
                  potential points are the stuff of dreams — and sometimes
                  regret.
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 ml-5 text-white">
                {weekData.highestPotential.map((team, idx) => (
                  <div key={idx}>
                    <span className="font-medium text-lg block">
                      {team.teamName}
                    </span>
                    <span className="block">
                      Had a potential score of {team.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* The Ryan Leaf */}
          <Card className="bg-black">
            <CardHeader>
              <div className="relative group inline-block">
                <CardTitle className="font-semibold text-xl text-orange-500 cursor-help">
                  🍃 The Ryan Leaf
                </CardTitle>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 rounded bg-black text-white text-xs p-2 text-center shadow-lg">
                  The Ryan Leaf — A masterclass in unfulfilled promise, this
                  award goes to the team whose roster had the least scoring
                  potential of the week. No matter how you shuffled the lineup,
                  the fantasy gods simply weren’t handing out points. Sometimes,
                  it’s just not your season… or your week… or your anything.
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 ml-5 text-white">
                {weekData.lowestPotential.map((team, idx) => (
                  <div key={idx}>
                    <span className="font-medium text-lg block">
                      {team.teamName}
                    </span>
                    <span className="block">
                      Had a potential score of {team.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
