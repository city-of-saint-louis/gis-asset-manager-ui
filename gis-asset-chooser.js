const defaultZoom = "12";
const defaultCenterX = "-90.25";
const defaultCenterY = "38.64";
const defaultBaseMap = "streets";
const defaultShowSearch = true;
const mapLayersToAdd = [];
const featurelayers = [];
const highlightedGraphics = []; // array to hold highlighted graphics

// Define the custom web component
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
// end of component class

// event listener to capture layer data from map-layer.js
document.addEventListener("layerDetailsProvided", (event) => {
  const mapLayer = event.detail;
  mapLayersToAdd.push(mapLayer);
  console.log("mapLayer", mapLayer);
  console.log("mapLayersToAdd", mapLayersToAdd);
});

// Load the map and layers
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
          layerProperties: {
            layerAssetIDFieldName: mapLayer.layerAssetIDFieldName,
            labelMask: mapLayer.labelMask,
            layerId: mapLayer.layerId,
            limit: mapLayer.limit,
            required: mapLayer.required,
            serverUrl: mapLayer.serverUrl,
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
            ${mapLayer.required ? `<p>Select at least 1 asset.</p>` : ""}

            ${
              mapLayer.limit > 0
                ? `<p>Select a maximum of ${mapLayer.limit} assets.</p>`
                : ""
            }
            <ul class="highlighted-asset-data-list" id="${mapLayer.layerId}">
            </ul>
          </div>
        `;
      });
      console.log("featurelayers", featurelayers);
      selectFeatureLayer();
      // hit test - for any layer graphics that the click 'hits'
      view.on("click", (event) => {
        view.hitTest(event).then(function (response) {
          let highlightedSelection;

          if (response.results.length) {
            console.log("response", response.results[0]);
            const graphic = response.results[0].graphic;
            // Get the layer info for this graphic
            const layerInfo = response.results[0].layer.portalItem;
            const layerProperties = response.results[0].layer.layerProperties;
            const layerAssetIDFieldName =
              response.results[0].layer.layerProperties.layerAssetIDFieldName;
            // console.log("layerAssetIDFieldName", layerAssetIDFieldName);
            // console.log("layerProperties", layerProperties);
            // console.log("layerInfo", layerInfo);
            if (
              !highlightedGraphics.find(
                (g) =>
                  g.highlightedGraphicId ===
                  graphic.attributes[layerAssetIDFieldName]
              )
            ) {
              view.whenLayerView(graphic.layer).then(function (layerView) {
                console.log("graphic.layer", graphic.layer);
                const layerAssetLimit = graphic.layer.layerProperties.limit;
                console.log("layerAssetLimit", layerAssetLimit);
                const totalLayerAssetsSelected = highlightedGraphics.filter(
                  (h) => h.layerId === graphic.layer.layerProperties.layerId
                ).length;
                console.log(
                  "totalLayerAssetsSelected",
                  totalLayerAssetsSelected
                );
                if (
                  layerAssetLimit > 0 &&
                  totalLayerAssetsSelected >= layerAssetLimit
                ) {
                  console.log("Layer limit reached");
                  return;
                }

                highlightedSelection = layerView.highlight(graphic);
                console.log(graphic);

                const highlightedGraphic = {
                  highlightedGraphicAttributes: graphic.attributes,
                  highlightedGraphicId:
                    graphic.attributes[layerAssetIDFieldName],
                  highlightSelect: highlightedSelection,
                  layerData: graphic.layer,
                  layerUid: graphic.layer.uid,
                  layerId: graphic.layer.layerProperties.layerId,
                  layerTitle: graphic.layer.title,
                  layerLabelMask: graphic.layer.layerProperties.labelMask,
                  layerAssetLimit: graphic.layer.layerProperties.limit,
                  layerAssetsRequired: graphic.layer.layerProperties.required,
                };

                highlightedGraphics.push(highlightedGraphic);
                console.log("Graphic now highlighted", graphic);
                console.log("highlightedGraphics", highlightedGraphics);
                renderLabelMask();
              });
            } else {
              highlightedGraphics.forEach(function (highlight) {
                if (
                  highlight.highlightedGraphicId ===
                  graphic.attributes[layerAssetIDFieldName]
                ) {
                  highlight.highlightSelect.remove();
                }
                console.log("Graphic unhighlighted.", graphic);
              });
              const hightlightToRemove = highlightedGraphics.findIndex(
                (h) =>
                  h.highlightedGraphicId ===
                  graphic.attributes[layerAssetIDFieldName]
              );
              highlightedGraphics.splice(hightlightToRemove, 1);
              renderLabelMask();
              console.log("highlightedGraphics", highlightedGraphics);
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
        // console.log("spanElement", spanElement);
        // console.log("Layer ID selected", layerId);
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
        }
      });
    });
  });
}

function renderLabelMask() {
  const selectedLayerAssetListArray = document.querySelectorAll(
    ".highlighted-asset-data-list"
  );
  console.log("selectedLayerAssetListArra", selectedLayerAssetListArray);
  // Clear existing list items before appending new ones
  selectedLayerAssetListArray.forEach((list) => {
    list.innerHTML = ''; // This clears the list
  });
  highlightedGraphics.forEach((highlightedGraphic) => {
    selectedLayerAssetListArray.forEach((selectedLayerAssetList) => {
      if (highlightedGraphic.layerId === selectedLayerAssetList.id) {
        console.log("highlightedGraphic.layerLabelMask", highlightedGraphic.layerLabelMask);
        const layerLabelMask = highlightedGraphic.layerLabelMask;
        console.log("layerLabelMask", layerLabelMask);
        const highlightedGraphicAttributes = highlightedGraphic.highlightedGraphicAttributes;
        console.log("highlightedGraphicAttributes", highlightedGraphicAttributes);

        const selectedAssetLabelMask = highlightedGraphicAttributes[layerLabelMask];
        console.log("selectedAssetLabelMask", selectedAssetLabelMask);
        const assetLabelMaskListItem = document.createElement("li");
        assetLabelMaskListItem.innerHTML = selectedAssetLabelMask;
        selectedLayerAssetList.appendChild(assetLabelMaskListItem);
        
      }
    });
  });
}

initializeMap();

document.addEventListener("DOMContentLoaded", () => {
  customElements.define("gis-asset-chooser", GISAssetChooserComponent);
});
