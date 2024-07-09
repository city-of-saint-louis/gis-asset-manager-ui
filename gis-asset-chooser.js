const defaultZoom = "12";
const defaultCenterX = "-90.25";
const defaultCenterY = "38.64";
const defaultBaseMap = "streets";
const defaultShowSearch = true;
const mapLayersToAdd = [];
const featureLayers = [];
// highlightGraphics variable to be deleted and replaced by chosenAssets
const highlightedGraphics = []; // array to hold highlighted graphics
const chosenAssets = []; // array to hold chosen assets
// const requiredLayerIds = [];
const allMapLayerIds = [];
let validLayers = [];
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
      <section style="padding: 2rem">
       <p>
        <strong>${title}</strong>
      </p>
       <p>
          ${hint}
       </p>
       <p id="validity-message" style="color: red;">Please make the required asset selections before submission</p>
      <div class="row">
	      <div class="col-md-8">
          <div id="viewDiv" style="width: 100%; height:400px; margin:0; padding:0; background-color:##dedede;">
          </div>
        </div>
        <div class="col-md-4">
          <div id="layer-data-div">
          </div>
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
            required: mapLayer.required,
            minimumAssetsRequired: mapLayer.minimumSelections,
            maximumAssetsRequired: mapLayer.maximumSelections,
            // limit: mapLayer.limit,
            // layerId: mapLayer.layerId,
            // serverUrl: mapLayer.serverUrl,
          },
        });
        console.log("layerToAdd", layerToAdd);
        layerToAdd.outFields = ["*"];
        layerToAdd.popupEnabled = false;
        featureLayers.push(layerToAdd);
        map.add(layerToAdd);
        const layerToAddId = `${layerToAdd.layerProperties.layerName}-${layerToAdd.id}`;
        const minAssetsRequired = parseInt(
          layerToAdd.layerProperties.minimumAssetsRequired
        );
        // console.log("minAssetsRequired", minAssetsRequired);
        const maxAssetsRequired = parseInt(
          layerToAdd.layerProperties.maximumAssetsRequired
        );
        // console.log("maxAssetsRequired", maxAssetsRequired);

        document.getElementById("layer-data-div").innerHTML += `
          <div class="map-layer-data-container stat-container">
            <span class="stat-title">${layerToAdd.layerProperties.layerName}
              <button class="selectLayers" att-layer-id="${
                layerToAdd.layerProperties.layerName
              }-${layerToAdd.id}">
            <span class="glyphicons glyphicons-eye-open "></span>
              </button>
            </span>
             <ul class="highlighted-asset-data-list" id="${
               layerToAdd.layerProperties.layerName
             }-${layerToAdd.id}"
              style="list-style-type: none; padding: 0; margin: 0;">
            
            </ul>
            <div style="font-size: small;">
            ${
              minAssetsRequired === 0
                ? `<p id="${layerToAddId}-min-asset-required-message" ><span class="label label-success">No asset selection required.</span></p>`
                : `<p id="${layerToAddId}-min-asset-required-message"><span class="label label-error">${minAssetsRequired} required.</span></p>`
            }
            ${
              maxAssetsRequired > 0
                ? `<p id="${layerToAddId}-max-asset-required-message"><span class="label label-success">Select a maximum of ${maxAssetsRequired} assets.</span></p>`
                : `<p id="${layerToAddId}-max-asset-required-message"><span class="label label-success">No upper limit on asset selection.</span></p>`
            }
                </div>
          </div>
        `;
      });
    
      extractAllLayerIds(featureLayers);

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
                const layerToAddId = `${graphic.layer.layerProperties.layerName}-${graphic.layer.id}`;
                const layerAssetMax = layerProperties.maximumAssetsRequired;
                console.log("layerAssetMax", layerAssetMax);
                const totalLayerAssetsSelected = highlightedGraphics.filter(
                  (h) =>
                    h.layerId ===
                    `${graphic.layer.layerProperties.layerName}-${graphic.layer.id}`
                ).length;
                console.log("totalLayerAssetsSelected",totalLayerAssetsSelected);
                if (
                  layerAssetMax > 0 &&
                  totalLayerAssetsSelected >= layerAssetMax
                ) {
                  document
                    .getElementById(
                      `${layerToAddId}-max-asset-required-message`
                    )
                    .classList.remove("label-success");
                  document
                    .getElementById(
                      `${layerToAddId}-max-asset-required-message`
                    )
                    .classList.add("label-error");
                  setTimeout(() => {
                    alert(
                      `You have alreay reached the maximum of ${layerAssetMax} assets for ${graphic.layer.layerProperties.layerName}.`
                    );
                    document
                      .getElementById(
                        `${layerToAddId}-max-asset-required-message`
                      )
                      .classList.remove("label-error");
                    document
                      .getElementById(
                        `${layerToAddId}-max-asset-required-message`
                      )
                      .classList.add("label-alert");
                  }, 500);
                  return;
                }

                highlightedSelection = layerView.highlight(graphic);

                // change highlightedGraphic to 'chosenAsset'
                const chosenAsset = {
                  assetAttributes: graphic.attributes,
                  assetId: `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`,
                  assetLabel: labelMaskValue,
                  layerData: graphic.layer,
                  layerId: `${graphic.layer.layerProperties.layerName}-${layerId}`,
                  layerName: graphic.layer.title,
                  layerClassUrl: graphic.layer.layerProperties.layerClassUrl,
                  layerAssetMax: graphic.layer.layerProperties.maximumAssetsRequired,
                  highlightSelect: highlightedSelection,
                };
                chosenAssets.push(chosenAsset);
                console.log("chosenAssets", chosenAssets);

                const highlightedGraphic = {
                  highlightedGraphicAttributes: graphic.attributes,
                  highlightedGraphicId: `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`,
                  assetLabel: labelMaskValue,
                  highlightSelect: highlightedSelection,
                  layerData: graphic.layer,
                  layerId: `${graphic.layer.layerProperties.layerName}-${layerId}`,
                  layerName: graphic.layer.title,
                  layerClassUrl: graphic.layer.layerProperties.layerClassUrl,
                  layerAssetMax: graphic.layer.layerProperties.maximumAssetsRequired,
                  layerAssetsRequired: graphic.layer.layerProperties.required,
                };
                highlightedGraphics.push(highlightedGraphic);
                console.log("highlightedGraphics", highlightedGraphics);
                renderSelectedAssetLabels();
                validateNumberofAssetsSelected();
              });
            } else {
              highlightedGraphics.forEach(function (highlight) {
                if (
                  highlight.highlightedGraphicId ===
                  `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
                ) {
                  highlight.highlightSelect.remove();
                }
              });
              const hightlightToRemove = highlightedGraphics.findIndex(
                (h) =>
                  h.highlightedGraphicId ===
                  `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
              );
              highlightedGraphics.splice(hightlightToRemove, 1);
              renderSelectedAssetLabels();
              validateNumberofAssetsSelected();
              console.log("highlightedGraphics", highlightedGraphics);
            }
          }
        });
      });
    });
  } catch (e) {
    console.error(e);
  }
};

function selectFeatureLayer() {
  featureLayers.forEach((outerLayer) => {
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
};

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
          "highlightedGraphic.assetLabel",
          highlightedGraphic.assetLabel
        );
       
        const assetLabel = highlightedGraphic.assetLabel;
        console.log("assetLabel", assetLabel);
        const highlightedGraphicAttributes =
          highlightedGraphic.highlightedGraphicAttributes;
        console.log(
          "highlightedGraphicAttributes",
          highlightedGraphicAttributes
        );
        // const selectedAssetLabelMask = assetLabel;
        const assetLabelListItem = document.createElement("li");
        assetLabelListItem.style.fontSize=".9rem";
        assetLabelListItem.setAttribute(
          "id",
          highlightedGraphic.highlightedGraphicId
        );
        assetLabelListItem.classList.add("stat-title");
        assetLabelListItem.innerHTML = `${assetLabel} 
          <a class="inverse-button red-button remove-asset-btn "style="color: red; cursor: pointer;"><span class="glyphicons glyphicons-remove small"> Remove</span></a>
        `;
        selectedLayerAssetList.appendChild(assetLabelListItem);
        assetLabelListItem.addEventListener("click", function () {
          highlightedGraphics.forEach((highlightedGraphic) => {
            console.log(assetLabelListItem.id);
            console.log("highlightedGraphic", highlightedGraphic);
            if (
              highlightedGraphic.highlightedGraphicId === assetLabelListItem.id
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
              validateNumberofAssetsSelected();
            }
          });
        });
      }
    });
  });
  // validateNumberofAssetsSelected();
};

//  extract and store required layer ids
function extractAllLayerIds(featureLayers) {
  featureLayers.forEach((layer) => {
    allMapLayerIds.push(`${layer.layerProperties.layerName}-${layer.id}`);
  });
  console.log("allMapLayerIds", allMapLayerIds);
};

function validateNumberofAssetsSelected() {
  
  featureLayers.forEach((mapLayer) => {
    let isLayerValid = false;
    const layerId = `${mapLayer.layerProperties.layerName}-${mapLayer.id}`;
    const layerAssetMin = parseInt(
      mapLayer.layerProperties.minimumAssetsRequired
    );
    const layerAssetMax = parseInt(
      mapLayer.layerProperties.maximumAssetsRequired
    );

    const totalLayerAssetsSelected = highlightedGraphics.filter(
      (highlightedGraphic) =>
        highlightedGraphic.layerId ===
        `${mapLayer.layerProperties.layerName}-${mapLayer.id}`
    ).length;

    console.log("totalLayerAssetsSelected", totalLayerAssetsSelected);
    console.log("layerAssetMin", layerAssetMin);
    console.log("layerAssetMax", layerAssetMax);
    console.log("layerId", layerId);
    if (layerAssetMin > 0 && totalLayerAssetsSelected >= layerAssetMin) {
      document.getElementById(
        `${layerId}-min-asset-required-message`
      ).innerHTML = "Minimum asset selection requirement met.";
      document
        .getElementById(`${layerId}-min-asset-required-message`)
        .classList.add("label", "label-success");
      isLayerValid = true;
      console.log("isLayerValid", isLayerValid, layerId);

      if (!validLayers.includes(layerId)) {
        validLayers.push(layerId);
      }

      console.log("validLayers", validLayers);
    }
    if (layerAssetMin > 0 && totalLayerAssetsSelected < layerAssetMin) {
      document.getElementById(
        `${layerId}-min-asset-required-message`
      ).innerHTML = `At least ${layerAssetMin} required.`;
      document
        .getElementById(`${layerId}-min-asset-required-message`)
        .classList.remove("label", "label-success");
      document
        .getElementById(`${layerId}-min-asset-required-message`)
        .classList.add("label", "label-error");
      isLayerValid = false;
      console.log("isLayerValid", isLayerValid, layerId);
      const layerToRemove = validLayers.findIndex((l) => l === layerId);
      validLayers.splice(layerToRemove, 1);
      // console.log("validLayers", validLayers);
      // console.log("layerToRemove", layerToRemove);

      validLayers = validLayers.filter((l) => l !== layerId);
      console.log("validLayers", validLayers);

    }
    if (layerAssetMax > 0 && totalLayerAssetsSelected === layerAssetMax) {
      document.getElementById(
        `${layerId}-max-asset-required-message`
      ).innerHTML = `Maximum of ${layerAssetMax} reached.`;
      document
        .getElementById(`${layerId}-max-asset-required-message`)
        .classList.remove("label", "label-success");
      document
        .getElementById(`${layerId}-max-asset-required-message`)
        .classList.add("label", "label-alert");
    }
    if (layerAssetMax > 0 && totalLayerAssetsSelected < layerAssetMax) {
      document
        .getElementById(`${layerId}-max-asset-required-message`)
        .classList.remove("label", "label-alert");
      document
        .getElementById(`${layerId}-max-asset-required-message`)
        .classList.add("label", "label-success");
      document.getElementById(
        `${layerId}-max-asset-required-message`
      ).innerHTML = `Select a maximum of ${layerAssetMax}.`;
    }
  });
  validateAssetSelection();
  renderVailidityMessage();
};

function validateAssetSelection() {
  
  console.log("validLayers", validLayers);
  console.log("allMapLayerIds", allMapLayerIds);
  
  if (validLayers.length !== allMapLayerIds.length) {
    isValid = false;
  }
  const sortedValidLayers = validLayers.sort();
  console.log("sortedValidLayers", sortedValidLayers);
  const sortedAllMapLayerIds = allMapLayerIds.sort();
  console.log("sortedAllMapLayerIds", sortedAllMapLayerIds);
  const stringifyValidLayers = JSON.stringify(sortedValidLayers);
  console.log("stringifyValidLayers", stringifyValidLayers);
  console.log("stringifyAllMapLayerIds", JSON.stringify(sortedAllMapLayerIds));
  const stringifyAllMapLayerIds = JSON.stringify(sortedAllMapLayerIds);
  if (stringifyValidLayers === stringifyAllMapLayerIds) {
    isValid = true;
  } else {
    isValid = false;
  }
  console.log("----------------isValid", isValid);
};

function renderVailidityMessage() {
  const validityMessage = document.getElementById("validity-message");
  if (isValid) {
    validityMessage.innerHTML = "Asset selection is valid for submission";
    validityMessage.style.color = "green";
  } else {
    validityMessage.innerHTML =
      "Please make the required asset selections before submission";
    validityMessage.style.color = "red";
  }
};

initializeMap();
// instantiate the custom component after the page has loaded
document.addEventListener("DOMContentLoaded", () => {
  customElements.define("gis-asset-chooser", GISAssetChooserComponent);
});
