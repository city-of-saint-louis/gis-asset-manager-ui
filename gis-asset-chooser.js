const defaultZoom = "12";
const defaultCenterX = "-90.25";
const defaultCenterY = "38.64";
const defaultBaseMap = "streets";
const defaultShowSearch = true;
const mapLayersToAdd = [];
const selectedGraphics = []; // array to hold selected graphics
const highlightedGraphics = []; // array to hold highlighted graphics
const featurelayers = []; // array to hold feature layers
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
      <section>
        <h3>${title}</h3>
        <div id="map-container" class="grid-container">
          <div class="grid-item" id="viewDiv-title"><h4>${hint}</h4>
          </div>
          <div class="grid-item" id="layer-data-title">
            <h5 id="map-layers-headline-desktop">Map Layers</h5>
          </div>
          <div class="grid-item" id="viewDiv">
          </div>
           <h5 id="map-layers-headline-mobile">Map Layers</h5>
          <div class="grid-item" id="layer-data-div">
          </div>
        </div>
      </section>
    `;
    } catch (e) {
      console.error(e);
      document.getElementById(
        "viewDiv"
      ).innerHTML = `<p>There was a problem loading the map. Please try again later.</p>`;
    }
  }
}

document.addEventListener("layerDetailsProvided", (event) => {
  const mapLayer = event.detail;
  mapLayersToAdd.push(mapLayer);
  console.log("mapLayer", mapLayer);
  console.log("mapLayersToAdd", mapLayersToAdd);
});

function initializeMap() {
  try {
    const zoom = document
      .querySelector("gis-asset-chooser")
      .getAttribute("zoom");
    const baseMap =
      document.querySelector("gis-asset-chooser").getAttribute("baseMap") ||
      defaultBaseMap;
    const centerX =
      document.querySelector("gis-asset-chooser").getAttribute("centerX") ||
      defaultCenterX;
    const centerY =
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
      const map = new Map({
        basemap: baseMap,
      });

      const view = new MapView({
        map: map,
        center: [centerX, centerY],
        zoom: zoom,
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
        console.log("layerToAdd", layerToAdd);
        layerToAdd.popupEnabled = false;
        featurelayers.push(layerToAdd);
        map.add(layerToAdd);
        document.getElementById("layer-data-div").innerHTML += `

          <div class="map-layer-data-container" class="content-block">
            <h6>${mapLayer.name}
              <a href="#" class="selectLayers pull-right" att-layer-id="${
                mapLayer.layerId
              }">
                <span class="glyphicons glyphicons-eye-open"></span>
              </a>

            </h6>
            ${
              mapLayer.required
                ? `<p>Select at least 1 asset from ${mapLayer.name}.</p>`
                : ""
            }

            ${
              mapLayer.limit > 0
                ? `<p>Select a maximum of ${mapLayer.limit} assets.</p>`
                : ""
            }

            <ul class="list-group" id="labelMask${mapLayer.layerId}">
            </ul>
          </div>
        `;
      });
      console.log("featurelayers", featurelayers);
      selectFeatureLayer();
      // hit test - for any layer graphics that the click 'hits'
      view.on("click", (event) => {
        view.hitTest(event).then(function (response) {
          let isParcel = false;
          let isBike = false;
          let isTree = false;
          let isFood = false;
          let highlightedSelection;

          if (response.results.length) {
            const graphic = response.results[0].graphic;
            // console.log("Graphic:", graphic);
            // Get the layer info for this graphic
            const layerInfo = response.results[0].layer.portalItem;
            const layerPortalID = layerInfo.id;
            // console.log("Layer's portal ID: " + layerPortalID);

            if (layerPortalID === "34f817a794c64919affc7ec449677de3") {
              isParcel = true;
              // console.log("isParcel", isParcel);
            }
            if (layerPortalID === "b0a2bf75ab284aba834328a5a8f6e28b") {
              isBike = true;
              // console.log("isBike", isBike);
            }
            if (layerPortalID === "46bd9d471a184f20a773224f494c45c8") {
              isTree = true;
              // console.log("isTree", isTree);
            }
            if (layerPortalID === "0da094b7d469485e9cd5172625cf6513") {
              isFood = true;
              // console.log("isFood", isFood);
            }
            if (isFood) {
              // console.log("Food site selected", graphic.attributes);
              if (
                !selectedGraphics.find(
                  (g) => g.attributes.OBJECTID === graphic.attributes.OBJECTID
                )
              ) {
                console.log("Graphic not already selected");
                selectedGraphics.push(graphic);
                view.whenLayerView(graphic.layer).then(function (layerView) {
                  highlightedSelection = layerView.highlight(graphic);

                  const hightlightDetail = {
                    objectId: graphic.attributes.OBJECTID,
                    highlightSelect: highlightedSelection,
                  };
                  highlightedGraphics.push(hightlightDetail);
                  console.log("highlightedGraphics", highlightedGraphics);
                  const mapLayerFound = mapLayersToAdd.find(
                    (item) => item.layerId === layerPortalID
                  );
                  let labelMask = mapLayerFound.labelMask;
                  generateLabelMask(labelMask, layerPortalID, graphic);
                });
              } else {
                console.log("Graphic already selected");
                const indexToRemove = selectedGraphics.findIndex(
                  (g) => g.attributes.OBJECTID === graphic.attributes.OBJECTID
                );
                selectedGraphics.splice(indexToRemove, 1);

                highlightedGraphics.forEach(function (highlight) {
                  if (highlight.objectId === graphic.attributes.OBJECTID) {
                    highlight.highlightSelect.remove();
                  }
                });

                const hightlightToRemove = highlightedGraphics.findIndex(
                  (h) => h.objectId === graphic.attributes.OBJECTID
                );
                highlightedGraphics.splice(hightlightToRemove, 1);

                console.log("highlightedGraphics ", highlightedGraphics);
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
                  highlightedSelection = layerView.highlight(graphic);
                  hightlightDetail = {
                    FID: graphic.attributes.FID,
                    highlightSelect: highlightedSelection,
                  };
                  highlightedGraphics.push(hightlightDetail);
                  console.log("highlightedGraphics", highlightedGraphics);
                  console.log("selectedGraphics", selectedGraphics);
                  //create label mask
                  const mapLayerFound = mapLayersToAdd.find(
                    (item) => item.layerId === layerPortalID
                  );
                  let labelMask = mapLayerFound.labelMask;
                  generateLabelMask(labelMask, layerPortalID, graphic);
                });
              } else {
                console.log("Graphic already selected");
                // console.log("selectedGraphics", selectedGraphics);
                const indexToRemove = selectedGraphics.findIndex(
                  (g) => g.attributes.FID === graphic.attributes.FID
                );
                selectedGraphics.splice(indexToRemove, 1);

                highlightedGraphics.forEach(function (highlight) {
                  if (highlight.FID === graphic.attributes.FID) {
                    highlight.highlightSelect.remove();
                  }
                });
                const hightlightToRemove = highlightedGraphics.findIndex(
                  (h) => h.FID === graphic.attributes.FID
                );
                highlightedGraphics.splice(hightlightToRemove, 1);
                console.log("highlightedGraphics", highlightedGraphics);
                console.log("selectedGraphics", selectedGraphics);
              }
            }
          }
        });
      });
    });
  } catch (e) {
    console.error(e);
  }
}

function selectFeatureLayer() {
  // console.log("checked featurelayers", featurelayers);
  featurelayers.forEach((outerLayer) => {
    const selectLayersElements = document.querySelectorAll(".selectLayers");
    selectLayersElements.forEach((selectLayer) => {
      selectLayer.addEventListener("click", (event) => {
        const layerId = selectLayer.getAttribute("att-layer-id");
        const spanElement = selectLayer.querySelector("span");
        console.log("spanElement", spanElement);
        console.log("Layer ID selected", layerId);
        if (outerLayer.portalItem.id === layerId) {
          if (outerLayer.visible) {
            outerLayer.visible = false;
            spanElement.classList.remove("glyphicons-eye-open");
            spanElement.classList.add("glyphicons-eye-close");
          } else {
            outerLayer.visible = true;
            spanElement.classList.remove("glyphicons-eye-close");
            spanElement.classList.add("glyphicons-eye-open");
          }
          //selectLayer.src = outerLayer.visible
          //  ? "small-eyeball-on-icon.png"
          //  : "small-eyeball-off-icon.png";
        }
      });
    });
  });
}
// Function to create Label Mask
const generateLabelMask = (labelMask, layerPortalID, graphic) => {
  const showlabelMask = document.getElementById(`labelMask${layerPortalID}`);
  const labelMaskItem = document.createElement("li");
  // console.log("Before replacement, labelMask:", labelMask);
  const outputString = labelMask.replace(/\{([^}]+)\}/g, (match, p1) => {
    return `" + graphic.attributes.${p1} + "`;
  });
  // Prepend and append a quote to handle static text at the beginning and end
  const finalString = `"${outputString}"`;
  const removeLabelMask = `<a class="removeLabelMask" href="#"  onclick="removeLabelMask('${layerPortalID}','${graphic.attributes.FID}',event)">
  <span class="glyphicons glyphicons-remove small">Remove</span>
  </a>`;
  //console.log("After replacement, modifiedLabelMask:", finalString);
  // Evaluate the finalString to resolve the attributes and concatenate them
  labelMaskItem.innerHTML = eval(finalString);
  labelMaskItem.innerHTML += removeLabelMask;
  showlabelMask.appendChild(labelMaskItem);
};

function removeHighLight(layerId, objectId) {
  highlightedGraphics.forEach(function (highlight) {
    if (highlight.FID === objectId) {
      highlight.highlightSelect.remove();
    }
  }); // Your function implementation here
}
function removeLabelMask(layerId, objectId, event) {
  const clickedElement = event.target;
  clickedElement.remove();
  console.log("Label Mask removed:", clickedElement);
  removeHighLight(layerId, objectId);
}

initializeMap();
document.addEventListener("DOMContentLoaded", () => {
  customElements.define("gis-asset-chooser", GISAssetChooserComponent);
});
