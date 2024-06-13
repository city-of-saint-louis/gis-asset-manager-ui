class GISAssetChooserComponent extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor.
    this.mapLayers = []; // Initialize an empty array to store map layers
  }

  connectedCallback() {
    console.log("gis-asset-chooser initialized");

    try {
      const title = this.getAttribute("title") || "";
      const hint = this.getAttribute("hint") || "";
      console.log("this", this);
      // const showSearch = this.getAttribute("showSearch") || false;
      // const allowPoints = this.getAttribute("allowPoints") || false;

      this.innerHTML = `
        <div id="map-container">
          <p>${title}</p>
          <p>${hint}</p>
          <div id="viewDiv" style="width: 45%; height: 40vh;">
          </div>
        </div>
      `;
    } catch (e) {
      console.error(e);
      document.getElementById(
        "viewDiv"
      ).innerHTML = `<p>There was a problem loading the map. Please try again later.</p>`;
    }
  }
}

const mapLayersToAdd = [];
console.log("mapLayersToAdd", mapLayersToAdd);
document.addEventListener("layerDetailsProvided", (event) => {
  
  const mapLayer = event.detail;
  mapLayersToAdd.push(mapLayer);
  console.log("mapLayer", mapLayer);
  console.log("mapLayersToAdd", mapLayersToAdd);
});

function initializeMap() {
  try {
    const zoomToApply = document.querySelector("gis-asset-chooser").getAttribute("zoom");
    console.log("zoomToApply", zoomToApply);
    const baseMapToApply = document.querySelector("gis-asset-chooser").getAttribute("baseMap") || "streets";
    const centerXToApply = document.querySelector("gis-asset-chooser").getAttribute("centerX");
    const centerYToApply = document.querySelector("gis-asset-chooser").getAttribute("centerY");
   
    require(["esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer"], (
      Map,
      MapView,
      FeatureLayer
    ) => {
      const map = new Map({
        basemap: baseMapToApply,
      });

      const view = new MapView({
        map: map,
        center: [centerXToApply, centerYToApply],
        zoom: zoomToApply,
        container: document.querySelector("#viewDiv"),
      });

      mapLayersToAdd.forEach((mapLayer) => {
        const layerToAdd = new FeatureLayer({
          portalItem: {
            id: mapLayer.layerId,
            portal: mapLayer.serverUrl,
          },
        });
        map.add(layerToAdd);
      });

    });
  } catch (e) {
    console.error(e);
  }
};
initializeMap();
document.addEventListener("DOMContentLoaded", () => {
  customElements.define("gis-asset-chooser", GISAssetChooserComponent);
});


