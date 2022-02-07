import Head from 'next/head';
import Welcome from '/src/components/Welcome';

function Home() {
  return (
    <div>
      <Head>
        <title>Open Data Portal</title>
        <meta name="description" content="Data portal for Karlskrona Archipelago Water Quality" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Welcome />
      </main>
    </div>
  )
}

export default Home;