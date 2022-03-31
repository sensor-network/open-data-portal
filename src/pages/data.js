import Container from "@mui/material/Container";

import ServerPaginationGrid from "src/components/ServerPaginationGrid";
import Visualization from "src/components/Visualization";
import Summary from "src/components/Summary";

export default function App() {
  return (
    <Container style={{ display: "flex", flexDirection: "column", gap: 50, marginBottom: 50 }} maxWidth={"xl"}>
      {/* TODO: Bring out data-grid to separate component */}
      <div style={{ width: "95%", maxWidth: 1000 }}>
        <h2>Explore the data on your own</h2>
        <p>Change the units using the preference modal from the navbar. </p>
        <ServerPaginationGrid/>
      </div>

      <Summary/>

      <Visualization/>
    </Container>
  );
}

