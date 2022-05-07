import type { NextPage } from "next";
import Container from "@mui/material/Container";
import ServerPaginationGrid from "~/components/ServerPaginationGrid";
import Visualization from "~/components/Visualization";
import Summary from "~/components/Summary";

const DataPage: NextPage<{}> = () => {
  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 50,
        marginBottom: 50,
        marginTop: 50,
      }}
      maxWidth={"xl"}
    >
      <ServerPaginationGrid />

      <Summary />

      <Visualization />
    </Container>
  );
};

export default DataPage;
