import Container from "@mui/material/Container";

const Footer = () => {
  return (
    <div style={{ borderTop: "1px solid #185693", boxShadow: "0 0 5px 0 #185693" }}>
      <Container style={{ padding: 20 }} maxWidth="xl">
        <p>{"<insert footer stuff here>"}</p>
      </Container>
    </div>
  );
};

export default Footer;