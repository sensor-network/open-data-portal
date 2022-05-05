import type { NextPage } from "next";
import Container from "@mui/material/Container";
import AdminView from "~/components/AdminDashboard";

const AdminPage: NextPage<{}> = () => {
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
      <AdminView />
    </Container>
  );
};

export default AdminPage;
