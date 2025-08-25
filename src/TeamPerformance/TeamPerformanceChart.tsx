import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface WeeklyData {
  week: number;
  points: number;
}

interface Props {
  teamName: string;
  weeklyPoints: number[];
}

export default function TeamPerformanceChart({
  teamName,
  weeklyPoints,
}: Props) {
  // Convert weeklyPoints into chart-friendly data
  const data: WeeklyData[] = weeklyPoints.map((points, index) => ({
    week: index + 1,
    points,
  }));

  return (
    <div className="p-4 rounded-2xl shadow-md hover:bg-slate-800/70 transition-colors bg-slate-900/50">
      <h2 className="text-xl text-slate-100 font-semibold mb-4 bg-emerald-700/80">
        {teamName} Weekly Performance
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="week"
            label={{ value: "Week", position: "insideBottomRight", offset: -5 }}
          />
          <YAxis
            label={{ value: "Points", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            labelFormatter={(label) => `Week ${label}`}
            contentStyle={{
              backgroundColor: "#1f2937", // Tailwind gray-800
              borderRadius: "0.5rem",
              border: "none",
              color: "white",
            }}
            itemStyle={{ color: "white" }}
            labelStyle={{ color: "white" }}
          />
          <Line
            type="monotone"
            dataKey="points"
            stroke="#4f46e5"
            strokeWidth={3}
            dot
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
