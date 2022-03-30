import { useContext } from "react";

import {
  ResponsiveContainer, ComposedChart,
  XAxis, YAxis,
  Area, Line,
  Legend, Brush, Tooltip,
} from "recharts";
import CloseIcon from "@mui/icons-material/Close";
import CircleIcon from "@mui/icons-material/Circle";

import { PreferenceContext } from "src/pages/_app";
import style from "src/styles/AreaChart.module.css";

const ComparisonGraph = ({ data, mainValue, valuesToCompare, dontCompareValue, dateFormatter }) => {
  const { preferences } = useContext(PreferenceContext);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const formattedDate = dateFormatter(label);
      return (
        <div className={style.chartToolTip}>
          <div className={style.dataLabel}>
            <p><strong>Measured at:</strong> {formattedDate}</p>
          </div>
          <div className={style.dataPayload}>
            {payload.map(row => {
              const unit = preferences[`${row.dataKey}_unit`]?.symbol;
              const capitalized = unit?.replace(/^\w/, ch => ch.toUpperCase());
              return (
                <p key={row.name} style={{ color: row.stroke }}>
                  <strong>{row.name}:</strong> {row.value} {capitalized}
                </p>
              );
            })}
          </div>

        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div style={{ display: "flex", gap: 15 }}>
        {
          payload.filter(p => p.dataKey !== mainValue.key).map((entry, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #e8e8e8",
                padding: "5px 10px",
                borderRadius: "20px",
                fontSize: "16px",
                display: "flex",
                gap: 1,
                alignItems: "center",
              }}
            >
              <CircleIcon fontSize={"small"} sx={{ color: entry.color, cursor: "pointer" }}/>
              {entry.value}
              <CloseIcon fontSize={"small"} sx={{ fontWeight: "bold", cursor: "pointer" }}
                         onClick={() => dontCompareValue(entry.dataKey)}/>
            </div>
          ))
        }
      </div>
    );
  };

  const CustomXAxisTick = ({ payload, x, y }) => {
    const date = new Date(payload.value);
    const formatted = dateFormatter(date);
    return (
      <g transform={`translate(${x},${y})`}>
        <text fontSize=".7em" x={0} y={0} dy={16} textAnchor={payload.index > 0 ? "middle" : "start"} fill="#666">
          {formatted}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={500}>
      <ComposedChart
        data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        padding={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <defs>
          <linearGradient key={mainValue.key} id={`area-gradient`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={mainValue.color} stopOpacity={0.6}/>
            <stop offset="95%" stopColor={mainValue.color} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date" height={60}
          tick={CustomXAxisTick} tickSize={12} interval={Math.round(data.length / 10)}
        />
        <Brush
          dataKey={"date"} stroke={mainValue.color} height={30} y={450}
          tickFormatter={date => dateFormatter(date)}
        />
        <YAxis
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }} orientation="right"
          domain={[0, dataMax => Math.round(dataMax * 1.1)]} mirror
          tick={{ strokeWidth: 1 }} minTickGap={5} tickCount={10}
        />
        <Legend verticalAlign="top" height={36} content={CustomLegend}/>
        <Tooltip content={CustomTooltip}/>
        <Area
          connectNulls type="monotone" dataKey={mainValue.key} name={mainValue.name} stroke={mainValue.color}
          fillOpacity={1} fill={`url(#area-gradient)`} key={mainValue.key} strokeWidth={2}
        />
        {valuesToCompare.map(v => (
          <Line
            connectNulls type="monotone" dataKey={v.key} name={v.name} stroke={v.color}
            key={v.key} dot={false} strokeWidth={2}
          />
        ))}
      </ComposedChart>

    </ResponsiveContainer>

  );
};

export default ComparisonGraph;