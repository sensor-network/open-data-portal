import Container from "@mui/material/Container";

import AdminView from "src/components/AdminDashboard";

export default function App() {
  return (
    <Container style={{ display: "flex", flexDirection: "column", gap: 50, marginBottom: 50 }} maxWidth={"xl"}>

      <AdminView/>

    </Container>
  );
}

