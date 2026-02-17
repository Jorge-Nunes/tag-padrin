import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { StatusDistribution } from '../../types/analytics';

interface StatusDonutProps {
  data: StatusDistribution[];
  total: number;
  uptime: number;
}

export function StatusDonut({ data, total, uptime }: StatusDonutProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="transition-all duration-300 hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content={({ active, payload }: any) => {
              if (active && payload && payload.length) {
                const item = payload[0];
                const percentage = total > 0 ? Math.round((item.value as number / total) * 100) : 0;
                return (
                  <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}: {item.value} ({percentage}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{uptime}%</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Uptime</span>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-[-20px]">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {item.name}: <strong className="text-gray-900 dark:text-white">{item.value}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
