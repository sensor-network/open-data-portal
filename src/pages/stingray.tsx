import type { NextPage } from "next";
import Container from "@mui/material/Container";
import StingrayView from "~/components/stingray";

const StingrayPage: NextPage<{}> = () => {
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
      <StingrayView />
    </Container>
  );
};

export default StingrayPage;
