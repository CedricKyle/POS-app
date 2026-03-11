import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ChartDataPoint, FilterMode } from "@/store/recordsSlice";

const chartConfig = {
  cash: {
    label: "Cash",
    color: "var(--chart-1)",
  },
  utang: {
    label: "Utang",
    color: "hsl(0 72% 51%)",
  },
} satisfies ChartConfig;

// XAxis intervals and dot visibility per mode
const AXIS_INTERVAL: Record<FilterMode, number | "preserveStartEnd"> = {
  daily: 5, // every 6 h → 0h 6h 12h 18h
  weekly: 0, // all 7 days
  monthly: 4, // every 5th day
  custom: "preserveStartEnd",
};

interface Props {
  data: ChartDataPoint[];
  filterMode: FilterMode;
}

export default function SalesLineChart({ data, filterMode }: Props) {
  const [showUtang, setShowUtang] = useState(false);

  if (data.length === 0) return null;

  const showDots =
    filterMode === "weekly" || (filterMode === "custom" && data.length <= 14);

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Sales Overview</CardTitle>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: "var(--color-cash)" }}
              />
              Cash
            </span>
            <button
              type="button"
              onClick={() => setShowUtang((v) => !v)}
              className="flex items-center gap-1.5 text-xs transition-opacity"
              style={{ opacity: showUtang ? 1 : 0.4 }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: "hsl(0 72% 51%)" }}
              />
              <span style={{ color: showUtang ? "hsl(0 72% 51%)" : undefined }}>
                Utang
              </span>
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 px-2 sm:px-4">
        <ChartContainer config={chartConfig} className="h-50 w-full sm:h-60">
          <LineChart
            data={data}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              interval={AXIS_INTERVAL[filterMode]}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              width={48}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    `₱${Number(value).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}`
                  }
                />
              }
            />
            <Line
              type="monotone"
              dataKey="cash"
              stroke="var(--color-cash)"
              strokeWidth={2}
              dot={showDots}
              activeDot={{ r: 5 }}
            />
            {showUtang && (
              <Line
                type="monotone"
                dataKey="utang"
                stroke="var(--color-utang)"
                strokeWidth={2}
                dot={showDots}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
