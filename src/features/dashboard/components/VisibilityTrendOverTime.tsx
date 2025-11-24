import { Info } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface VisibilityTrendsProps {
  signUp?: () => void;
}

// interface JoinWaitlistProps {
//   signUp?: () => void;
//   text: string;
// }

// const JoinWaitlist: React.FC<JoinWaitlistProps> = ({ signUp, text }) => {
//   return (
//     <div className="mt-4">
//       <p className="text-sm text-gray-600 mb-2">{text}</p>
//       <button
//         onClick={signUp}
//         className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//       >
//         Join Waitlist
//       </button>
//     </div>
//   );
// };

function getDaysInMonth(month: number, year: number) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString("en-US", {
    month: "short",
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

const VisibilityTrendsOverTime: React.FC<VisibilityTrendsProps> = () => {
  const navigate = useNavigate();
  const daysData = getDaysInMonth(4, 2024);

  const directData = [
    300, 900, 600, 1200, 1500, 1800, 2400, 2100, 2700, 3000, 1800, 3300, 3600,
    3900, 4200, 4500, 3900, 4800, 5100, 5400, 4800, 5700, 6000, 6300, 6600,
    6900, 7200, 7500, 7800, 8100,
  ];

  const referralData = [
    500, 900, 700, 1400, 1100, 1700, 2300, 2000, 2600, 2900, 2300, 3200, 3500,
    3800, 4100, 4400, 2900, 4700, 5000, 5300, 5600, 5900, 6200, 6500, 5600,
    6800, 7100, 7400, 7700, 8000,
  ];

  const organicData = [
    1000, 1500, 1200, 1700, 1300, 2000, 2400, 2200, 2600, 2800, 2500, 3000,
    3400, 3700, 3200, 3900, 4100, 3500, 4300, 4500, 4000, 4700, 5000, 5200,
    4800, 5400, 5600, 5900, 6100, 6300,
  ];

  const chartData = daysData.map((day, index) => ({
    day,
    direct: directData[index],
    referral: referralData[index],
    organic: organicData[index],
  }));

  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="flex justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <p className="text-4xl font-bold text-gray-900">13,277</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              +35%
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-2 mb-4">
          AI conversations scanned in last 30 days
        </p>

        <div className="blur-sm">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={chartData}
              margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReferral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e40af" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#1e40af" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                tickLine={false}
                interval={4}
                height={24}
              />
              <YAxis
                width={50}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Area
                type="linear"
                dataKey="direct"
                stackId="1"
                stroke="#93c5fd"
                fill="url(#colorDirect)"
              />
              <Area
                type="linear"
                dataKey="referral"
                stackId="1"
                stroke="#3b82f6"
                fill="url(#colorReferral)"
              />
              <Area
                type="linear"
                dataKey="organic"
                stackId="1"
                stroke="#1e40af"
                fill="url(#colorOrganic)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-400 mb-2">
            This chart displays time series visibility scores for brands showing
            in this survey. NetRanks provides daily, weekly or custom reports.
          </p>

          {/* Banner Overlay */}
          <div
            onClick={() => navigate("/signin")}
            className="inset-0 rounded-[20px]"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 max-w-full mx-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  Activate full NetRanks access to automate your prompts and
                  keep rankings up to date around the clock.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisibilityTrendsOverTime;
