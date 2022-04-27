import Container from "@mui/material/Container";

import ServerPaginationGrid from "src/components/ServerPaginationGrid";
import Dashboard from "src/components/Dashboard";
import Visualization from "src/components/Visualization";
import Summary from "src/components/Summary";

export default function App() {
  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 50,
        marginBottom: 50,
      }}
      maxWidth={"xl"}
    >
      <ServerPaginationGrid />

      <Summary />

      <Visualization />
    </Container>
  );
}
