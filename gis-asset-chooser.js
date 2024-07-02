const defaultZoom = "12";
const defaultCenterX = "-90.25";
const defaultCenterY = "38.64";
const defaultBaseMap = "streets";
const defaultShowSearch = true;
const mapLayersToAdd = [];
const featurelayers = [];
const highlightedGraphics = []; // array to hold highlighted graphics
const chosenAssets = []; // array to hold chosen assets
const requiredLayerIds = [];
let isValid = false;

// Define the custom web component
class GISAssetChooserComponent extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor for a custom web component
  }

  connectedCallback() {
    console.log("gis-asset-chooser initialized");
    try {
      const title = this.getAttribute("title") || "";
      const hint = this.getAttribute("hint") || "";
      // const allowPoints = this.getAttribute("allowPoints") || false;
      this.innerHTML = `
      <section id="gis-asset-chooser-container">
        <div id="map-container" class="grid-container stat-container">
          <div class="grid-item" id="map-title-container">
            <h3 id="map-title" class="stat-title">${title}</h3>
            <h4 >${hint}</h4>
            <h6 id="validity-message"></h6>
          </div>
         
          <div class="grid-item" id="layer-data-title">
          </div>
          <div class="grid-item" id="viewDiv">
          </div>
          <div class="grid-item" id="layer-data-div">
          </div>
          <div>
            <h6 id="validity-message"></h6>
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
});
console.log("mapLayersToAdd", mapLayersToAdd);

// initilize the map using the map layers provided
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
        // console.log("layerToAdd", layerToAdd);
        layerToAdd.popupEnabled = false;
        featurelayers.push(layerToAdd);
        map.add(layerToAdd);
        document.getElementById("layer-data-div").innerHTML += `
          <div class="map-layer-data-container stat-container">
            <span class="stat-title">${layerToAdd.layerProperties.layerName}
              <a href="#" class="selectLayers" att-layer-id="${
                layerToAdd.layerProperties.layerName
              }-${layerToAdd.id}">
            <span class="glyphicons glyphicons-eye-open "></span>
              </a>
            </span>
             <ul class="highlighted-asset-data-list" id="${
              layerToAdd.layerProperties.layerName
            }-${layerToAdd.id}">
            
            </ul>
            ${
              layerToAdd.layerProperties.required
                ? `<p style="color:red; font-size: small;" id="asset-required-message">At least 1 asset required.</p>`
                : ""
            }
            ${
              layerToAdd.layerProperties.limit > 0
                ? `<p style="font-size: small;">Select a maximum of ${layerToAdd.layerProperties.limit} assets.</p>`
                : `<p style="font-size: small;">Select as many assets as needed.</p>`
            }
          </div>
        `;
      });
      console.log("featurelayers", featurelayers);
      extractRequiredLayerIds(featurelayers);

      selectFeatureLayer();
      // hit test - for any layer graphics that the click 'hits'
      view.on("click", (event) => {
        view.hitTest(event).then(function (response) {
          let highlightedSelection;
          if (response.results.length) {
            const graphic = response.results[0].graphic;
            console.log("graphic", graphic);
            console.log(
              `${graphic.layer.layerProperties.layerName}-${graphic.layer.id}`
            );
            const layerProperties = response.results[0].layer.layerProperties;
            const layerAssetIDFieldName = layerProperties.layerAssetIDFieldName;
            // change labelMaskValue to assetLabelValue
            const labelMaskValue = eval(
              `"${graphic.layer.layerProperties.labelMask.replace(
                /\{([^}]+)\}/g,
                (match, p1) => `" + graphic.attributes.${p1} + "`
              )}"`
            );
            console.log("layerAssetIDFieldName", layerAssetIDFieldName);
            const layerId = graphic.layer.id;
            if (
              !highlightedGraphics.find(
                (g) =>
                  g.highlightedGraphicId ===
                  `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
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
                // console.log(graphic);
                // change highlightedGraphic to 'chosenAsset'
                const highlightedGraphic = {
                  highlightedGraphicAttributes: graphic.attributes,
                  highlightedGraphicId: `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`,
                  // change layerLabelMask to highlightedGraphicLabel
                  layerLabelMask: labelMaskValue,
                  highlightSelect: highlightedSelection,
                  layerData: graphic.layer,
                  layerId: `${graphic.layer.layerProperties.layerName}-${layerId}`,
                  layerTitle: graphic.layer.title,
                  layerClassUrl: graphic.layer.layerProperties.layerClassUrl,
                  layerAssetLimit: graphic.layer.layerProperties.limit,
                  layerAssetsRequired: graphic.layer.layerProperties.required,
                };
                highlightedGraphics.push(highlightedGraphic);
                // console.log("Graphic now highlighted", graphic);
                console.log("highlightedGraphics", highlightedGraphics);
                renderSelectedAssetLabels();
                validateAssetSelection();
              });
            } else {
              highlightedGraphics.forEach(function (highlight) {
                // console.log("highlight", highlight);
                // console.log("graphic", graphic);
                if (
                  highlight.highlightedGraphicId ===
                  `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
                ) {
                  highlight.highlightSelect.remove();
                }
                // console.log("Graphic unhighlighted.", graphic);
              });
              const hightlightToRemove = highlightedGraphics.findIndex(
                (h) =>
                  h.highlightedGraphicId ===
                  `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
              );
              highlightedGraphics.splice(hightlightToRemove, 1);
              renderSelectedAssetLabels();
              validateAssetSelection();
              console.log("highlightedGraphics", highlightedGraphics);
            }
          }
        });
      });
      validateAssetSelection()
    });
  } catch (e) {
    console.error(e);
  }
  console.log("highlightedGraphics", highlightedGraphics);
}

function selectFeatureLayer() {
  featurelayers.forEach((outerLayer) => {
    const selectLayersElements = document.querySelectorAll(".selectLayers");
    selectLayersElements.forEach((selectLayer) => {
      selectLayer.addEventListener("click", () => {
        const layerId = selectLayer.getAttribute("att-layer-id");
        const spanElement = selectLayer.querySelector("span");
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
}

function renderSelectedAssetLabels() {
  const selectedLayerAssetListArray = document.querySelectorAll(
    ".highlighted-asset-data-list"
  );
  console.log("selectedLayerAssetListArray", selectedLayerAssetListArray);
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
        // change 'layerLabelMask' to 'assetLabel'
        const layerLabelMask = highlightedGraphic.layerLabelMask;
        console.log("layerLabelMask", layerLabelMask);
        const highlightedGraphicAttributes =
          highlightedGraphic.highlightedGraphicAttributes;
        console.log(
          "highlightedGraphicAttributes",
          highlightedGraphicAttributes
        );
        // const selectedAssetLabelMask = layerLabelMask;
        const assetLabelListItem = document.createElement("li");
        assetLabelListItem.setAttribute(
          "id",
          highlightedGraphic.highlightedGraphicId
        );
        assetLabelListItem.classList.add("stat-title");
        assetLabelListItem.innerHTML = `${layerLabelMask} 
        <span class="remove-asset-btn glyphicons glyphicons-remove small" style="color: red; margin-left: 100px;"> Remove</span>
        `;
        selectedLayerAssetList.appendChild(assetLabelListItem);
        assetLabelListItem.addEventListener("click", function () {
          highlightedGraphics.forEach((highlightedGraphic) => {
            console.log(assetLabelListItem.id);
            console.log("highlightedGraphic", highlightedGraphic);
            if (
              highlightedGraphic.highlightedGraphicId ===
              assetLabelListItem.id
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
              validateAssetSelection()
            }
          });
        });
      }
    });
  });
  console.log("highlightedGraphics", highlightedGraphics);
}

//  extract and store required layer ids
function extractRequiredLayerIds(featurelayers) {
  const requiredLayers = featurelayers.filter(
    (layer) => layer.layerProperties.required
  );
  console.log("requiredLayers", requiredLayers);
  requiredLayers.forEach((layer) => {
    requiredLayerIds.push(`${layer.layerProperties.layerName}-${layer.id}`);
  });
  console.log("requiredLayerIds", requiredLayerIds);
}

// function to validate asset selection
function validateAssetSelection() {
  const chosenAssetLayerIds = highlightedGraphics.map(
    (highlightedGraphic) => highlightedGraphic.layerId
  );
  console.log("chosenAssetLayerIds", chosenAssetLayerIds);
  if (
    requiredLayerIds.every((layerId) => chosenAssetLayerIds.includes(layerId))
  ) {
    isValid = true;
  } else {
    isValid = false;
  }
  console.log("isValid", isValid);
  const validityMessage = document.getElementById("validity-message");
  if (isValid) {
    validityMessage.innerHTML = "Asset selection is valid for submission";
    validityMessage.style.color = "green";
    document.getElementById("asset-required-message").style.color = "green";
    document.getElementById("asset-required-message").innerHTML = "Selection requirements met.";
  } else {
    validityMessage.innerHTML = "Please make the required asset selections before submission";
    validityMessage.style.color = "red";
    document.getElementById("asset-required-message").style.color = "red";
    document.getElementById("asset-required-message").innerHTML = "At least 1 asset required.";
  }
}

initializeMap();

// instantiate the custom component after the page has loaded
document.addEventListener("DOMContentLoaded", () => {
  customElements.define("gis-asset-chooser", GISAssetChooserComponent);
});

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
