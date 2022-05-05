import Container from "@mui/material/Container";
import { PRIMARY_BLUE_COLOR } from "~/lib/constants";

const Footer: React.FC = () => {
  return (
    <div
      style={{
        borderTop: `1px solid ${PRIMARY_BLUE_COLOR}`,
        boxShadow: `0 0 5px 0 ${PRIMARY_BLUE_COLOR}`,
      }}
    >
      <Container style={{ padding: 20 }} maxWidth="xl">
        <p>{"<insert footer stuff here>"}</p>
      </Container>
    </div>
  );
};

export default Footer;
