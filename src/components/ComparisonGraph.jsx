import { useContext, useMemo } from "react";

import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Area,
  Line,
  Legend,
  Brush,
  Tooltip,
} from "recharts";
import CloseIcon from "@mui/icons-material/Close";
import CircleIcon from "@mui/icons-material/Circle";
import { Skeleton } from "@mui/material";

import { PreferenceContext } from "~/lib/utils/preferences";
import { useWidth } from "~/lib/hooks";
import { capitalize } from "~/lib/utils/capitalize";

import style from "~/styles/ComparisonGraph.module.css";

const ComparisonGraph = ({
  data,
  error,
  height,
  mainValue,
  valuesToCompare,
  dontCompareValue,
  dateFormatter,
}) => {
  const { preferences } = useContext(PreferenceContext);

  const windowWidth = useWidth();
  const xAxisInterval = useMemo(() => {
    if (error) return null;
    return windowWidth < 768
      ? Math.floor(data.length / 5)
      : windowWidth < 1400
      ? Math.floor(data.length / 10)
      : Math.floor(data.length / 15);
  }, [windowWidth, data, error]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const formattedDate = dateFormatter(label);
      return (
        <div className={style.chartToolTip}>
          <div className={style.dataLabel}>
            <p>
              <strong>Measured at:</strong> {formattedDate}
            </p>
          </div>
          <div className={style.dataPayload}>
            {payload.map((row) => {
              /* use optional chaining for sensors without units, e.g. ph */
              const unit = preferences[`${row.dataKey}Unit`]?.symbol;
              const capitalized = capitalize(unit);
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
      <div style={{ display: "flex", gap: 15, marginTop: -10 }}>
        {payload
          .filter((p) => p.value !== mainValue.name)
          .map((entry, idx) => (
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
              <CircleIcon
                fontSize={"small"}
                sx={{ color: entry.color, cursor: "pointer" }}
              />
              {entry.value}
              <CloseIcon
                fontSize={"small"}
                sx={{ fontWeight: "bold", cursor: "pointer" }}
                onClick={() => dontCompareValue(entry.value)}
              />
            </div>
          ))}
      </div>
    );
  };

  const CustomXAxisTick = ({ payload, x, y }) => {
    const date = new Date(payload.value);
    const formatted = dateFormatter(date);
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          fontSize=".6em"
          x={0}
          y={0}
          dy={16}
          textAnchor={payload.index > 0 ? "middle" : "start"}
          fill="#666"
          transform="rotate(-20)"
        >
          {formatted}
        </text>
      </g>
    );
  };

  if (error) {
    return (
      <div style={{ width: "100%", height: "100%", minHeight: height }}>
        <h4 style={{ margin: "5px 0" }}>
          Sorry, but there is no data matching your selected filters.
        </h4>
        <p style={{ margin: "5px 0" }}>
          Try selecting a longer time-range or change the preferred location in
          the settings-menu at the top.
        </p>
        <Skeleton
          animatin="wave"
          variant="rectangular"
          width="100%"
          height={height - 100}
        />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={height}>
      <ComposedChart
        data={data}
        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        padding={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <defs>
          <linearGradient
            key={mainValue.key}
            id={`area-gradient`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor={mainValue.color} stopOpacity={0.6} />
            <stop offset="95%" stopColor={mainValue.color} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          height={60}
          tick={CustomXAxisTick}
          tickSize={12}
          interval={xAxisInterval}
        />
        <Brush
          dataKey={"time"}
          stroke={mainValue.color}
          height={30}
          y={460}
          tickFormatter={(date) => dateFormatter(date)}
        />
        <YAxis
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          orientation="right"
          yAxisId="right"
          domain={[0, (dataMax) => Math.round(dataMax * 1.1)]}
          mirror
          tick={{ strokeWidth: 2 }}
          minTickGap={5}
          tickCount={10}
        />
        <YAxis
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          orientation="left"
          yAxisId="left"
          domain={[0, (dataMax) => Math.round(dataMax * 1.1)]}
          mirror
          tick={{ strokeWidth: 2 }}
          minTickGap={5}
          tickCount={10}
        />
        <Legend verticalAlign="top" height={36} content={CustomLegend} />
        <Tooltip content={CustomTooltip} />
        <Area
          connectNulls
          type="monotone"
          yAxisId="right"
          dataKey={`sensors[${mainValue.key}].avg`}
          name={mainValue.name}
          stroke={mainValue.color}
          fillOpacity={1}
          fill={`url(#area-gradient)`}
          key={mainValue.key}
          strokeWidth={2}
        />
        {valuesToCompare.map((v) => (
          <Line
            connectNulls
            type="monotone"
            yAxisId="left"
            dataKey={`sensors[${v.key}].avg`}
            name={v.name}
            stroke={v.color}
            key={v.key}
            dot={false}
            strokeWidth={2}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default ComparisonGraph;
