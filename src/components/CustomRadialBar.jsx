import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from "recharts";


const CustomRadialBar = ({ min, avg, max }) => {
  const data = [
    { name: "Min", value: min, fill: "#1565c0" },
    { name: "Avg", value: avg, fill: "#A4C42F" },
    { name: "Max", value: max, fill: "#A83636" },
  ];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        innerRadius="25%"
        outerRadius="100%"
        data={data}
        startAngle={180}
        endAngle={0}
        barSize={50}
        cx="50%" cy="50%"
      >
        <RadialBar
          label={{ position: "inside", fill: "#e8e8e8" }}
          background={false}
          clockWise
          dataKey="value"
        />
        <Legend iconSize={10} layout="horizontal" verticalAlign="top" align="center"/>
      </RadialBarChart>
    </ResponsiveContainer>
  );
};
export default CustomRadialBar;