import "./App.css";
import TeamLineupViewer from "./TeamLineupViewer";
import Luck from "./Luck";
import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../@/components/ui/tabs";

import YearSelect from "./YearSelection";
import { Card } from "../@/components/ui/card";
import UnderConstruction from "./UnderConstruction";
import WeeklyAwards from "./Awards/WeeklyAwards";

function App() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019];
  return (
    <div className="min-h-screen bg-[#F2E8CF] text-gray-900">
      <header className="shadow p-4 bg-[#F2E8CF]">
        <h1 className="text-2xl font-bold text-center">
          The League's Stats Calculator
        </h1>
      </header>
      <main className="p-6 max-w-4xl mx-auto relative z-0 !overflow-visible">
        <Tabs
          defaultValue="Welcome"
          className="mb-4 bg-[#386641] rounded-lg shadow p-2"
        >
          <TabsList className="flex flex-wrap gap-2 justify-center space-x-4 mx-auto z-10 mb-10">
            <TabsTrigger className="flex-none" value="Welcome">
              Welcome
            </TabsTrigger>
            <TabsTrigger className="flex-none" value="Optimal Lineup">
              Optimal Lineup
            </TabsTrigger>
            <TabsTrigger className="flex-none" value="Luck">
              Luck
            </TabsTrigger>
            <TabsTrigger className="flex-none" value="Weekly Awards">
              Weekly Awards
            </TabsTrigger>
            <TabsTrigger className="flex-none" value="Coach Rating">
              Coach Rating
            </TabsTrigger>
            <TabsTrigger className="flex-none" value="Power Rating">
              Power Rating
            </TabsTrigger>
            <TabsTrigger className="flex-none" value="Team Performance">
              Team Performance
            </TabsTrigger>
          </TabsList>
          <TabsContent value="Welcome" className="flex justify-center mx-auto">
            <div className="text-center flex justify-center items-center flex-col space-y-4">
              <Card className="bg-[#386641] p-6">
                <h1 className="text-3xl font-bold mb-4 text-yellow-500">
                  Welcome to{" "}
                  <span className="text-white">The League Stats</span> 🏆
                </h1>
                <p className="mb-4 text-lg">
                  This isn’t your average fantasy site. Here, we track{" "}
                  <span className="font-semibold text-yellow-400">
                    everything
                  </span>{" "}
                  — from your weekly scores to the{" "}
                  <span className="font-semibold text-yellow-400">
                    best possible lineups
                  </span>{" "}
                  you never played, from{" "}
                  <span className="font-semibold text-yellow-400">
                    Power Rankings
                  </span>{" "}
                  to our infamous
                  <span className="font-semibold text-yellow-400">
                    {" "}
                    Luck
                  </span>{" "}
                  metric that exposes who’s coasting on easy matchups.
                </p>
                <p className="mb-4 text-lg">
                  Scout your next opponent. Prove your dominance. Or watch
                  someone’s
                  <span className="font-semibold text-yellow-400">
                    {" "}
                    Cinderella season
                  </span>{" "}
                  crash and burn.
                </p>
                <p className="text-lg font-semibold text-red-400">
                  Stats don’t lie 💀 — but they will ruin friendships.
                </p>
              </Card>

              <YearSelect
                selectedYear={String(selectedYear)}
                onYearChange={(year) => setSelectedYear(Number(year))}
                years={years}
              />
            </div>
          </TabsContent>
          <TabsContent value="Optimal Lineup">
            <TeamLineupViewer year={selectedYear} />
          </TabsContent>
          <TabsContent value="Luck">
            <Luck selectedYear={selectedYear} />
          </TabsContent>
          <TabsContent value="Weekly Awards">
            <WeeklyAwards selectedYear={selectedYear} />
          </TabsContent>
          <TabsContent value="Coach Rating">
            <UnderConstruction />
          </TabsContent>
          <TabsContent value="Power Rating">
            <UnderConstruction />
          </TabsContent>
          <TabsContent value="Team Performance">
            <UnderConstruction />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
