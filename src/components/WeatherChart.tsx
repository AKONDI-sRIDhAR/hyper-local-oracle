import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

interface WeatherChartProps {
  hourlyData: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  timezone: string;
}

const WeatherChart = ({ hourlyData, timezone }: WeatherChartProps) => {
  // Take next 24 hours
  const chartData = hourlyData.time.slice(0, 24).map((time, index) => {
    const date = new Date(time);
    const hours = date.getHours();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return {
      time: `${displayHour}${period}`,
      temp: Math.round(hourlyData.temperature_2m[index]),
      fullTime: time,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900">{payload[0].payload.time}</p>
          <p className="text-lg font-bold text-blue-600">{payload[0].value}°</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-6 shadow-2xl">
        <h3 className="text-xl font-light text-white mb-4">24-Hour Forecast</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.3)' }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.3)' }}
              domain={['dataMin - 2', 'dataMax + 2']}
              unit="°"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="hsl(45,100%,60%)"
              strokeWidth={3}
              dot={{ fill: 'hsl(45,100%,60%)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
};

export default WeatherChart;
