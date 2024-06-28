const defaultZoom = "12";
const defaultCenterX = "-90.25";
const defaultCenterY = "38.64";
const defaultBaseMap = "streets";
const defaultShowSearch = true;
const mapLayersToAdd = [];
const featurelayers = [];
const highlightedGraphics = []; // array to hold highlighted graphics
const chosenAssets = []; // array to hold chosen assets
// let isValid = false;

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
          url: mapLayer.layerClassUrl,
          // portalItem: {
          //   id: mapLayer.layerId,
          //   portal: mapLayer.serverUrl,
          // },
          layerProperties: {
            layerName: mapLayer.name,
            layerClassUrl: mapLayer.layerClassUrl,
            layerAssetIDFieldName: mapLayer.layerAssetIDFieldName,
            labelMask: mapLayer.labelMask,
            limit: mapLayer.limit,
            required: mapLayer.required,
            // layerId: mapLayer.layerId,
            // serverUrl: mapLayer.serverUrl,
          },
        });

        layerToAdd.outFields = ["*"];
        console.log("layerToAdd", layerToAdd);
        layerToAdd.popupEnabled = false;
        featurelayers.push(layerToAdd);
        map.add(layerToAdd);
        document.getElementById("layer-data-div").innerHTML += `
          <div class="map-layer-data-container" class="content-block">
            <h6>${layerToAdd.layerProperties.layerName}
              <a href="#" class="selectLayers pull-right" att-layer-id="${
                layerToAdd.layerProperties.layerName
              }-${layerToAdd.id}">
          <span class="glyphicons glyphicons-eye-open"></span>
              </a>
            </h6>
            ${
              layerToAdd.layerProperties.required
                ? `<p>Select at least 1 asset.</p>`
                : ""
            }
            ${
              layerToAdd.layerProperties.limit > 0
                ? `<p>Select a maximum of ${layerToAdd.layerProperties.limit} assets.</p>`
                : `<p>Select as many assets as needed.</p>`
            }
            <ul class="highlighted-asset-data-list" id="${
              layerToAdd.layerProperties.layerName
            }-${layerToAdd.id}">
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
            // console.log("response", response.results[0]);
            const graphic = response.results[0].graphic;
            console.log("graphic", graphic);
            console.log(
              `${graphic.layer.layerProperties.layerName}-${graphic.layer.id}`
            );
            // Get the layer info for this graphic
            // const layerInfo = response.results[0].layer.portalItem;
            // console.log("layerInfo", layerInfo);
            const layerProperties = response.results[0].layer.layerProperties;
            // console.log("layerProperties", layerProperties);
            const layerAssetIDFieldName = layerProperties.layerAssetIDFieldName;
            const labelMaskValue = eval(
              `"${graphic.layer.layerProperties.labelMask.replace(
                /\{([^}]+)\}/g,
                (match, p1) => `" + graphic.attributes.${p1} + "`
              )}"`
            );
            console.log("layerAssetIDFieldName", layerAssetIDFieldName);
            const layerId = graphic.layer.id;
            // console.log("layerId", layerId);
            if (
              !highlightedGraphics.find(
                (g) =>
                  g.highlightedGraphicId ===
                  `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
                // graphic.attributes[layerAssetIDFieldName]
              )
            ) {
              view.whenLayerView(graphic.layer).then(function (layerView) {
                console.log("graphic.layer", graphic.layer);
                const layerAssetLimit = layerProperties.limit;
                console.log("layerAssetLimit", layerAssetLimit);
                const totalLayerAssetsSelected = highlightedGraphics.filter(
                  (h) =>
                    h.layerId ===
                    `${graphic.layer.layerProperties.layerName}-${graphic.layer.id}`
                ).length;
                console.log(
                  "totalLayerAssetsSelected",
                  totalLayerAssetsSelected
                );
                if (
                  layerAssetLimit > 0 &&
                  totalLayerAssetsSelected >= layerAssetLimit
                ) {
                  alert(
                    `You have reached the limit of ${layerAssetLimit} assets for ${graphic.layer.layerProperties.layerName}.`
                  );
                  console.log("Layer limit reached");
                  return;
                }

                highlightedSelection = layerView.highlight(graphic);
                console.log(graphic);

                const highlightedGraphic = {
                  highlightedGraphicAttributes: graphic.attributes,
                  highlightedGraphicId: `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`,
                  highlightSelect: highlightedSelection,
                  layerData: graphic.layer,
                  layerId: `${graphic.layer.layerProperties.layerName}-${layerId}`,
                  layerTitle: graphic.layer.title,
                  layerClassUrl: graphic.layer.layerProperties.layerClassUrl,
                  // edit below property to highlightedGraphicLabel
                  layerLabelMask: labelMaskValue,
                  layerAssetLimit: graphic.layer.layerProperties.limit,
                  layerAssetsRequired: graphic.layer.layerProperties.required,
                };
                highlightedGraphics.push(highlightedGraphic);
                console.log("Graphic now highlighted", graphic);
                console.log("highlightedGraphics", highlightedGraphics);
                renderSelectedAssetLabels();
               

                // function generateAssetLabel(layerLabelMask, attributes) {
                //   // Regular expression to find all placeholders like {PROPERTY}
                //   const placeholderRegex = /{([^}]+)}/g;
                //   let assetLabel = layerLabelMask;
                //   // Replace each placeholder with corresponding attribute value
                //   assetLabel = assetLabel.replace(
                //     placeholderRegex,
                //     (match, placeholder) => {
                //       // If the placeholder exists in attributes, return its value; otherwise, return an empty string
                //       return attributes.hasOwnProperty(placeholder)
                //         ? attributes[placeholder]
                //         : "";
                //     }
                //   );
                //   return assetLabel;
                // }
                // // Extract values from highlightedGraphic
                // const {
                //   highlightedGraphicAttributes,
                //   highlightedGraphicId,
                //   layerClassUrl,
                //   layerLabelMask,
                // } = highlightedGraphic;
                // // Generate assetLabel dynamically
                // const assetLabel = generateAssetLabel(
                //   layerLabelMask,
                //   highlightedGraphicAttributes
                // );
                // // Create chosenAsset object
                // const chosenAsset = {
                //   assetId: highlightedGraphicId,
                //   assetLabel: assetLabel,
                //   assetAttributes: highlightedGraphicAttributes,
                //   layerClassUrl: layerClassUrl,
                // };
                // // console.log('chosenAsset',chosenAsset);
                // // Add chosenAsset to chosenAssets array
                // chosenAssets.push(chosenAsset);
                // console.log("chosenAssets", chosenAssets);
              });

              
            } else {
              highlightedGraphics.forEach(function (highlight) {
                console.log("highlight", highlight);
                console.log("graphic", graphic);
                if (
                  highlight.highlightedGraphicId ===
                  `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
                ) {
                  highlight.highlightSelect.remove();
                }
                console.log("Graphic unhighlighted.", graphic);
              });
              const hightlightToRemove = highlightedGraphics.findIndex(
                (h) =>
                  h.highlightedGraphicId ===
                  `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
              );
              highlightedGraphics.splice(hightlightToRemove, 1);
              renderSelectedAssetLabels();

              console.log("highlightedGraphics", highlightedGraphics);
            }
          }
        });
      });
    });
  } catch (e) {
    console.error(e);
  }
  console.log("highlightedGraphics", highlightedGraphics);
}

function selectFeatureLayer() {
  // console.log("checked featurelayers", featurelayers);
  featurelayers.forEach((outerLayer) => {
    // console.log("outerLayer", outerLayer);
    const selectLayersElements = document.querySelectorAll(".selectLayers");

    selectLayersElements.forEach((selectLayer) => {
      // console.log("selectLayer", selectLayer);
      selectLayer.addEventListener("click", () => {
        const layerId = selectLayer.getAttribute("att-layer-id");
        const spanElement = selectLayer.querySelector("span");
        // console.log("Layer ID selected", layerId);
        if (
          `${outerLayer.layerProperties.layerName}-${outerLayer.id}` === layerId
        ) {
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
  console.log("highlightedGraphics", highlightedGraphics);
}

function renderSelectedAssetLabels() {
  const selectedLayerAssetListArray = document.querySelectorAll(
    ".highlighted-asset-data-list"
  );
  console.log("selectedLayerAssetListArra", selectedLayerAssetListArray);
  // Clear existing list items before appending new ones
  selectedLayerAssetListArray.forEach((list) => {
    list.innerHTML = ""; // This clears the list
  });
  highlightedGraphics.forEach((highlightedGraphic) => {
    console.log("highlightedGraphic", highlightedGraphic);
    selectedLayerAssetListArray.forEach((selectedLayerAssetList) => {
      if (highlightedGraphic.layerId === selectedLayerAssetList.id) {
        console.log(
          "highlightedGraphic.layerLabelMask",
          highlightedGraphic.layerLabelMask
        );
        const layerLabelMask = highlightedGraphic.layerLabelMask;
        console.log("layerLabelMask", layerLabelMask);
        const highlightedGraphicAttributes =
          highlightedGraphic.highlightedGraphicAttributes;
        console.log(
          "highlightedGraphicAttributes",
          highlightedGraphicAttributes
        );

        const selectedAssetLabelMask = layerLabelMask;
        console.log("selectedAssetLabelMask", selectedAssetLabelMask);
        const assetLabelMaskListItem = document.createElement("li");

        assetLabelMaskListItem.setAttribute(
          "id",
          highlightedGraphic.highlightedGraphicId
        );

        assetLabelMaskListItem.innerHTML = `${selectedAssetLabelMask} 
        <br/>
        <span class="remove-asset-btn glyphicons glyphicons-remove small"></span>
        Remove`;
        selectedLayerAssetList.appendChild(assetLabelMaskListItem);

        assetLabelMaskListItem.addEventListener("click", function () {
          highlightedGraphics.forEach((highlightedGraphic) => {
            console.log(assetLabelMaskListItem.id);
            console.log("highlightedGraphic", highlightedGraphic);
            if (
              highlightedGraphic.highlightedGraphicId ===
              assetLabelMaskListItem.id
            ) {
              highlightedGraphic.highlightSelect.remove();

              const listItemToRemove = document.getElementById(
                highlightedGraphic.highlightedGraphicId
              );
              if (listItemToRemove) listItemToRemove.remove();
              const hightlightToRemove = highlightedGraphics.findIndex(
                (h) =>
                  h.highlightedGraphicId ===
                  highlightedGraphic.highlightedGraphicId
              );
              highlightedGraphics.splice(hightlightToRemove, 1);
              // renderSelectedAssetLabels();

              console.log("highlightedGraphics", highlightedGraphics);
            }
          });
        });
      }
    });
  });
  console.log("highlightedGraphics", highlightedGraphics);
}

initializeMap();

// instantiate the custom component after the page has loaded
document.addEventListener("DOMContentLoaded", () => {
  customElements.define("gis-asset-chooser", GISAssetChooserComponent);
});
