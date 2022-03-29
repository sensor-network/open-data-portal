import { Card as RawCard } from "@mui/material";

const BORDER_COLOR = "#e0e0e0";
const SHADOW_COLOR = "#8a8a8a";
const style = {
  card: {
    boxShadow: `0 0 10px ${SHADOW_COLOR}`,
    padding: "20px 0",
  },
  header: {
    borderBottom: `1px solid ${BORDER_COLOR}`,
    padding: "0 20px",
  },
  body: {
    padding: "0 20px",
  },
  content: {
    minWeight: 300,
    minWidth: 300,
  },
};

/* Wrapper for MUI-Card with a title */
const Card = ({ title, children }) => {
  return (
    <RawCard style={style.card}>
      <div style={style.header}>
        <h2 style={{ marginTop: 0, marginBottom: 20 }}>{title}</h2>
      </div>
      <div style={style.body}>
        {children}
      </div>
    </RawCard>
  );
};

export default Card;