import { useRouter } from "next/router";
import { useEffect } from "react";
import { NextPage } from "next";

const LATEST_VERSION = "/docs/v3";

/* This page is just a redirect to the latest documentation version */
const Docs: NextPage<{}> = () => {
  const router = useRouter();
  useEffect(() => {
    router.push(LATEST_VERSION);
  }, [router]);
  return <div style={{ minHeight: "80vh" }}>Redirecting to latest version</div>;
};

/* intercept request and redirect on server if possible */
Docs.getInitialProps = ({ res }) => {
  if (res) {
    res.writeHead(301, {
      Location: LATEST_VERSION,
    });
    res.end();
  }
  return {};
};

export default Docs;
