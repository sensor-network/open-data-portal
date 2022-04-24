import Card from "src/components/Card";
import Left from "src/components/DashboardLeft";
import Right from "src/components/DashboardRight";

const paneStyle = {
  width: "50%",
  minHeight: 200,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const Dashboard: React.FC = () => {
  return (
    <Card title="Dashboard" margin={20}>
      <div style={{ display: "flex" }}>
        <div style={paneStyle}>
          <Left />
        </div>
        <div style={paneStyle}>
          <Right />
        </div>
      </div>
    </Card>
  );
};

export default Dashboard;