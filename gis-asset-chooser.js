class GISAssetChooserComponent extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor.
  }

  connectedCallback() {
    console.log("gis-asset-chooser initialized");

    try {
      const title = this.getAttribute("title") || "";
      const hint = this.getAttribute("hint") || "";
      // const allowPoints = this.getAttribute("allowPoints") || false;

      this.innerHTML = `
        <div id="map-container">
          <p>${title}</p>
          <p>${hint}</p>
          <div id="viewDiv" style="width: 80%; height:60vh;">
          </div>
        </div>
       <div>
          <p>Trees <img src="small-eyeball-on-icon.png" class="selectLayers" att-layer-id="46bd9d471a184f20a773224f494c45c8"></p>
          <p>Bike Riding <img src="small-eyeball-on-icon.png" class="selectLayers" att-layer-id="b0a2bf75ab284aba834328a5a8f6e28b"></p>

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

const defaultZoom = "12";
const defaultCenterX = "-90.25";
const defaultCenterY = "38.64";
const defaultBaseMap = "streets";
const defaultShowSearch = true;
const mapLayersToAdd = [];
const featurelayers = [];
// console.log("mapLayersToAdd", mapLayersToAdd);
const selectedGraphics = []; // array to hold selected graphics
const highlights = [];
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
    console.log("zoomToApply", zoomToApply) || defaultZoom;
    const baseMapToApply =
      document.querySelector("gis-asset-chooser").getAttribute("baseMap") ||
      defaultBaseMap;
    const centerXToApply =
      document.querySelector("gis-asset-chooser").getAttribute("centerX") ||
      defaultCenterX;
    const centerYToApply =
      document.querySelector("gis-asset-chooser").getAttribute("centerY") ||
      defaultCenterY;
    const showSearch =
      document.querySelector("gis-asset-chooser").getAttribute("showSearch") ||
      defaultShowSearch;
    require([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/FeatureLayer",
      "esri/widgets/Search",
    ], (Map, MapView, FeatureLayer, Search) => {
      var layerViewsCollection = [];
      const map = new Map({
        basemap: baseMapToApply,
      });

      const view = new MapView({
        map: map,
        center: [centerXToApply, centerYToApply],
        zoom: zoomToApply,
        container: document.querySelector("#viewDiv"),
      });

      if (showSearch) {
        const searchWidget = new Search({
          view: view,
        });

        // Add the search widget to the top right corner of the view
        view.ui.add(searchWidget, {
          position: "top-right",
        });
      }

      mapLayersToAdd.forEach((mapLayer) => {
        const layerToAdd = new FeatureLayer({
          portalItem: {
            id: mapLayer.layerId,
            portal: mapLayer.serverUrl,
          },
        });
        layerToAdd.outFields = ["*"];
        console.log("layerToAdd-ID", layerToAdd.layerId);
        featurelayers.push(layerToAdd);
        layerToAdd.popupEnabled = false;
        map.add(layerToAdd);
      });
      selectFeatureLayer();
      // hit test - for any layer graphics that the click 'hits'
      view.on("click", (event) => {
        view.hitTest(event).then(function (response) {
          let isParcel = false;
          let isBike = false;
          let isTree = false;
          let isFood = false;
          let highlightSelect;

          if (response.results.length) {
            const graphic = response.results[0].graphic;
            console.log("Graphic:", graphic);
            const layerInfo = response.results[0].layer.portalItem;
            const layerPortalID = layerInfo.id;
            console.log("Layer's portal ID: " + layerPortalID);

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
                view.whenLayerView(graphic.layer).then(function (layerView) {
                  const highlightSelect = layerView.highlight(graphic);
                  const hightlightDetail = {
                    objectId: graphic.attributes.OBJECTID,
                    highlightSelect: highlightSelect,
                  };
                  highlights.push(hightlightDetail);
                  console.log("highlightSelects", highlights);
                });
              } else {
                console.log("Graphic already selected food");
                const indexToRemove = selectedGraphics.findIndex(
                  (g) => g.attributes.OBJECTID === graphic.attributes.OBJECTID
                );
                selectedGraphics.splice(indexToRemove, 1);

                highlights.forEach(function (highlight) {
                  if (highlight.objectId === graphic.attributes.OBJECTID) {
                    highlight.highlightSelect.remove();
                  }
                });

                const hightlightToRemove = highlights.findIndex(
                  (h) => h.objectId === graphic.attributes.OBJECTID
                );
                highlights.splice(hightlightToRemove, 1);

                console.log("highlights ", highlights);
                console.log("selectedGraphics", selectedGraphics);
              }
            } else {
              if (
                !selectedGraphics.find(
                  (g) => g.attributes.FID === graphic.attributes.FID
                )
              ) {
                console.log("Graphic not already selected");
                selectedGraphics.push(graphic);
                view.whenLayerView(graphic.layer).then(function (layerView) {
                  const highlightSelect = layerView.highlight(graphic);
                  hightlightDetail = {
                    FID: graphic.attributes.FID,
                    highlightSelect: highlightSelect,
                  };
                  highlights.push(hightlightDetail);
                  console.log("highlightSelects", highlights);
                });
              } else {
                console.log("Graphic already selected");
                console.log("highlightSelect remove", highlightSelect);
                const indexToRemove = selectedGraphics.findIndex(
                  (g) => g.attributes.FID === graphic.attributes.FID
                );
                selectedGraphics.splice(indexToRemove, 1);
                highlights.forEach(function (highlight) {
                  if (highlight.FID === graphic.attributes.FID) {
                    highlight.highlightSelect.remove();
                  }
                });
                const hightlightToRemove = highlights.findIndex(
                  (h) => h.FID === graphic.attributes.FID
                );
                highlights.splice(hightlightToRemove, 1);

                console.log("highlights ", highlights);
              }
            }
            console.log("Selected graphics:", selectedGraphics);
          }
        });
      });
    });
  } catch (e) {
    console.error(e);
  }
}

function selectFeatureLayer() {
  console.log("checked featurelayers", featurelayers);
  featurelayers.forEach((outerLayer) => {
    const selectLayersElements = document.querySelectorAll(".selectLayers");
    selectLayersElements.forEach((selectLayer) => {
      selectLayer.addEventListener("click", (event) => {
        const layerId = selectLayer.getAttribute("att-layer-id");
        // console.log("Layer ID selected", layerId);
        if (outerLayer.portalItem.id === layerId) {
          //foundLayer.visible = !foundLayer.visible;
          if (outerLayer.visible) {
            outerLayer.visible = false;
          } else {
            outerLayer.visible = true;
          }
          selectLayer.src = outerLayer.visible
            ? "small-eyeball-on-icon.png"
            : "small-eyeball-off-icon.png";
          console.log("Layer chooser visible", outerLayer);
        }
      });
    });
  });
}

initializeMap();
document.addEventListener("DOMContentLoaded", () => {
  customElements.define("gis-asset-chooser", GISAssetChooserComponent);
});
