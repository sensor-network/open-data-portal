import Image from "next/image";
import Card from "src/components/Card";

function Welcome() {
  return (
    <div style={{ padding: 20, width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Card title="Welcome">
        <div>
          <p>This application is a work in progress, including:</p>

          <p>- A basic API</p>
          <p>- API Documentation</p>
          <p>- Data Grid for exploring data</p>
          <p>- Basic overview diagram of the data</p>

          <p>Explore using the tabs in the navbar, and change the unit which the data
            is presented in using the preference modal.</p>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Image src={"/bth.png"} width={400} height={400}/>
        </div>
      </Card>
    </div>
  );
}

export default Welcome;