import dynamic from "next/dynamic";

/* disable ssr for map-component */
const MapWithNoSSR = dynamic(() => import("../components/Map"), {
  ssr: false,
});

const MapPage = () => {
  /* all state etc */
  return (
    <div>
      {/* render DOM as usual*/}
      <div>
        <MapWithNoSSR />
      </div>
    </div>
  );
};
export default MapPage;
