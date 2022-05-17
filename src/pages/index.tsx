import type { NextPage } from "next";
import Dashboard from "~/components/Dashboard";

const HomePage: NextPage<{}> = () => {
  return (
    <div>
      <div style={{ width: "95%", margin: "0 auto 40px auto" }}>
        <Dashboard />
      </div>
    </div>
  );
};

export default HomePage;
