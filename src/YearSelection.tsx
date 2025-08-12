import { Label } from "../@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "../@/components/ui/select";

interface YearSelectProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  years?: number[];
}

export default function YearSelect({
  selectedYear,
  onYearChange,
  years = [2025, 2024, 2023, 2022, 2021, 2020, 2019],
}: YearSelectProps) {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Label htmlFor="Season" className="font-medium">
        Season:
      </Label>
      <Select value={selectedYear} onValueChange={onYearChange}>
        <SelectTrigger className="w-[150px] bg-white text-black dark:bg-white dark:text-black border border-gray-300">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent className="bg-white text-black border border-gray-300 z-[9999]">
          {years.map((year) => (
            <SelectItem
              key={year}
              value={String(year)}
              className="text-black text-base focus:bg-gray-100 data-[highlighted]:bg-gray-100 data-[highlighted]:text-black cursor-pointer"
            >
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
