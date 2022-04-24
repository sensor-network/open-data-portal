import Head from "next/head";
import Welcome from "/src/components/Welcome";
import Dashboard from "src/components/Dashboard"
export default function Home() {
  return (
    <div>
      <Head>
        <title>Open Data Portal</title>
        <meta name="description" content="Data portal for Karlskrona Archipelago Water Quality"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <main>
        {/*<Welcome/>*/}
        <Dashboard/>
      </main>
    </div>
  );
}

