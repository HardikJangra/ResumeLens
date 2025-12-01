import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ScoreChartProps {
  overall: number;
  ats: number;
}

export default function ScoreChart({ overall, ats }: ScoreChartProps) {
  const data = [
    { name: "Overall", value: overall },
    { name: "ATS", value: ats },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
