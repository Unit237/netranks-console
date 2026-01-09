import dayjs from "dayjs";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FilteredBrand, VisibilityTrendData } from "../@types";

interface VisibilityTrendsOverTimeProps {
  visibilityTrend: VisibilityTrendData[];
  filteredBrand: FilteredBrand;
}

interface ChartDataPoint {
  date: string;
  value: number;
}

export default function VisibilityTrendsOverTime({
  visibilityTrend,
  filteredBrand,
}: VisibilityTrendsOverTimeProps) {
  // Prepare chart data
  const chartData: ChartDataPoint[] =
    visibilityTrend?.map((x) => ({
      date: dayjs(x.Date).format("DD MMM YYYY"),
      value: parseInt(
        (
          (100 * x.NumberOfAnswersMentioningThisBrand) /
          x.TotalNumberOfAnswers
        ).toString()
      ),
    })) || [];

  return (
    <div className="w-full mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-5">
        <h2 className="m-0 mb-4 text-sm font-semibold text-gray-900">
          Visibility Trends Over Time
        </h2>

        {!filteredBrand || !visibilityTrend ? (
          <p className="text-xs opacity-50 m-0">
            Choose a brand from the filter panel above this page to track
          </p>
        ) : (
          <>
            <div className="w-full h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1976d2" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#1976d2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                    interval="preserveStartEnd"
                    angle={0}
                  />
                  <YAxis width={50} tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      padding: "8px",
                    }}
                    formatter={(value: number | string | undefined) => [
                      `${typeof value === 'number' ? value : value ?? 0}%`,
                      filteredBrand!.Name,
                    ]}
                  />
                  <Area
                    type="linear"
                    dataKey="value"
                    stroke="#1976d2"
                    strokeWidth={2}
                    fill="url(#colorValue)"
                    dot={{ fill: "#1976d2", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4">
              <p className="text-xs opacity-50 m-0">
                This chart displays time series visibility score percentages for{" "}
                <b>
                  <u>{filteredBrand.Name}</u>
                </b>{" "}
                showing in this survey.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
