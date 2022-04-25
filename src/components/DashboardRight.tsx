import dynamic from "next/dynamic";
/* disable ssr for map-component */
const MapWithNoSSR = dynamic(() => import("../components/DashboardMap"), {
  ssr: false,
});

const Right: React.FC = () => {
  return (
    <div style={{ height: 500, width: "100%" }}>
      <MapWithNoSSR />
    </div>
  );
};

export default Right;
