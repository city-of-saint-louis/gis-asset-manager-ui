// Import the Extent class dynamically
const initializeMap = async () => {
  const Extent = await $arcgis.import("@arcgis/core/geometry/Extent.js");

  // Define the extent
  const stLouisExtent = new Extent({
    xmin: -10054448.855908303,
    ymin: 4654966.477336443,
    xmax: -10038240.32627997,
    ymax: 4689440.938430255,
    spatialReference: { wkid: 102100 }, // Web Mercator
  });

  // Create the <arcgis-map> component
  const mapContainer = document.querySelector("#viewDiv");
  const arcgisMap = document.createElement("arcgis-map");
  arcgisMap.setAttribute("basemap", "topo-vector");
  mapContainer.appendChild(arcgisMap);

  // Wait for the map view to be ready
  arcgisMap.addEventListener("arcgisViewReadyChange", () => {
    const view = arcgisMap.view; // Access the view object
    console.log("View is ready:", view);

    // Apply the extent programmatically
    view.goTo(stLouisExtent).catch((error) => {
      console.error("Error applying extent:", error);
    });

    // Enforce the extent as a constraint
    view.constraints = {
      geometry: stLouisExtent, // Restrict navigation to this extent
      minZoom: view.zoom, // Optional: Prevent zooming out too far
    };
  });
};

// Initialize the map
initializeMap();