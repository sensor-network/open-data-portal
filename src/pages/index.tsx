import type { NextPage } from "next";
import Head from "next/head";
import Dashboard from "~/components/Dashboard";

const HomePage: NextPage<{}> = () => {
  return (
    <div>
      <Head>
        <title>Open Data Portal</title>
        <meta
          name="description"
          content="Data portal for Karlskrona Archipelago Water Quality"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ width: "95%", margin: "0 auto 40px auto" }}>
        <Dashboard />
      </div>
    </div>
  );
};

export default HomePage;
