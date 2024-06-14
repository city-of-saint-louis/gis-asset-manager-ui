class GISAssetChooserComponent extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor.
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
          <div id="viewDiv" style="width: 80%; height:60vh;">
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
const selectedGraphics = []; // array to hold selected graphics

document.addEventListener("layerDetailsProvided", (event) => {
  const mapLayer = event.detail;
  mapLayersToAdd.push(mapLayer);
  console.log("mapLayer", mapLayer);
  console.log("mapLayersToAdd", mapLayersToAdd);
});

function initializeMap() {
  try {
    const zoomToApply = document
      .querySelector("gis-asset-chooser")
      .getAttribute("zoom");
    console.log("zoomToApply", zoomToApply);
    const baseMapToApply =
      document.querySelector("gis-asset-chooser").getAttribute("baseMap") ||
      "streets";
    const centerXToApply = document
      .querySelector("gis-asset-chooser")
      .getAttribute("centerX");
    const centerYToApply = document
      .querySelector("gis-asset-chooser")
      .getAttribute("centerY");

    require([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/FeatureLayer",
      "esri/portal/PortalItem",
    ], (Map, MapView, FeatureLayer, PortalItem) => {
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
        layerToAdd.outFields = ["*"];
        console.log("layerToAdd", layerToAdd);
        layerToAdd.popupEnabled = false;
        map.add(layerToAdd);
      });
      // hit test goes here
      // for any layer graphics that the click 'hits'
      view.on("click", (event) => {
        view.hitTest(event).then(function (response) {
          if (response.results.length) {
            const graphic = response.results[0].graphic;
            console.log("Graphic:", graphic);
            // selectedGraphics.push(graphic);
            // Get the layer info for this graphic
            const layerInfo = response.results[0].layer.portalItem;
            const layerPortalID = layerInfo.id;
            console.log("Layer's portal ID: " + layerPortalID);

            let isParcel = false;
            let isBike = false;
            let isTree = false;
            let isFood = false;

            if (layerPortalID === "34f817a794c64919affc7ec449677de3") {
              isParcel = true;
              console.log("isParcel", isParcel);
            }
            if (layerPortalID === "b0a2bf75ab284aba834328a5a8f6e28b") {
              isBike = true;
              console.log("isBike", isBike);
            }
            if (layerPortalID === "46bd9d471a184f20a773224f494c45c8") {
              isTree = true;
              console.log("isTree", isTree);
            }
            if (layerPortalID === "0da094b7d469485e9cd5172625cf6513") {
              isFood = true;
              console.log("isFood", isFood);
            }
            if (isFood) {
              console.log("Food site selected", graphic.attributes);
              if (
                !selectedGraphics.find(
                  (g) => g.attributes.OBJECTID === graphic.attributes.OBJECTID
                )
              ) {
                console.log("Graphic not already selected");
                selectedGraphics.push(graphic);
                console.log("selectedGraphics", selectedGraphics);
              } else {
                console.log("Graphic already selected");
                // console.log("selectedGraphics", selectedGraphics);
              }
            } else {
              if (
                !selectedGraphics.find(
                  (g) => g.attributes.FID === graphic.attributes.FID
                )
              ) {
                console.log("Graphic not already selected");
                selectedGraphics.push(graphic);
                // console.log("selectedGraphics", selectedGraphics);
              } else {
                console.log("Graphic already selected");
                // console.log("selectedGraphics", selectedGraphics);
              }
            }
            console.log("Selected graphics:", selectedGraphics);

            // Highlight selected graphic
            view.whenLayerView(graphic.layer).then(function (layerView) {
              layerView.highlight(graphic);
            });
          }
        });
      });
    });
  } catch (e) {
    console.error(e);
  }
}
initializeMap();
document.addEventListener("DOMContentLoaded", () => {
  customElements.define("gis-asset-chooser", GISAssetChooserComponent);
});
