
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface TestProgressData {
  score: number;
  created_at: string;
  attempt_number: number;
}

interface TestProgressChartProps {
  data: TestProgressData[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-sm">
        <p className="font-medium">{`Lần thử #${payload[0].payload.attempt}`}</p>
        <p className="text-primary">{`Điểm: ${payload[0].value}%`}</p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(label), 'dd MMM yyyy, HH:mm', { locale: vi })}
        </p>
      </div>
    );
  }

  return null;
};

const TestProgressChart = ({ data, title = "Tiến trình làm bài" }: TestProgressChartProps) => {
  const chartData = React.useMemo(() => {
    return data.map(item => ({
      date: item.created_at,
      score: item.score,
      attempt: item.attempt_number
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(tick) => format(new Date(tick), 'dd/MM/yy')}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tickFormatter={(tick) => `${tick}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Điểm số"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Chưa có dữ liệu tiến trình làm bài
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestProgressChart;
