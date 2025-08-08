import "./App.css";
import TeamLineupViewer from "./TeamLineupViewer";
import Luck from "./Luck";
import React, { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../@/components/ui/tabs";

import YearSelect from "./YearSelection";

function App() {
  const currentYear = new Date().getFullYear();
  console.log("Current Year:", currentYear);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019];
  console.log("selectedYear:", selectedYear);
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
          <TabsList className="flex justify-center space-x-4 mx-auto">
            <TabsTrigger value="Welcome">Welcome</TabsTrigger>
            <TabsTrigger value="Optimal Lineup">Optimal Lineup</TabsTrigger>
            <TabsTrigger value="Luck">Luck</TabsTrigger>
          </TabsList>
          <TabsContent value="Welcome" className="flex justify-center mx-auto">
            <div className="text-center flex justify-center items-center flex-col space-y-4">
              <h2 className="text-xl font-semibold mb-4">
                Welcome to The League's Stats
              </h2>
              <h3>
                Here you will find pointless stats for our pointless (but way
                too addicting) fantasy game.
              </h3>

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
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Luck</h2>
              <p>
                This section is under construction. Stay tuned for updates on
                how luck plays a role in our fantasy league!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
