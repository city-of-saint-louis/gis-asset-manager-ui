const defaultZoom = "12";
const defaultCenterX = "-90.25";
const defaultCenterY = "38.64";
const defaultBaseMap = "streets";
const defaultShowSearch = true;
const mapLayersToAdd = [];
const featureLayers = [];
const chosenAssets = []; 
const allMapLayerIds = [];
const layersWithNoSelectionRequired = [];
const validLayers = [];
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
      // keep line below for future reference
      // const allowPoints = this.getAttribute("allowPoints") || false;
      this.innerHTML = `
      <section style="padding: 2rem">
       <p>
         <strong>${title}</strong>
       </p>
       <p>
         ${hint}
       </p>
       <p id="validity-message"></p>
       <div class="row">
	       <div class="col-md-7">
           <div id="viewDiv" style="width: 100%; height: 500px;">
         </div>
       </div>
        <div class="col-md-5 stat-container">
          <div id="layer-data-div" class="stat-group ">
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
      .getAttribute("zoom") || defaultZoom;
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
        // Add the search widget to the top right corner of the map view
        view.ui.add(searchWidget, {
          position: "top-right",
        });
      }

      mapLayersToAdd.forEach((mapLayer) => {
        const mapDataLayer = new FeatureLayer({
          url: mapLayer.layerClassUrl,
          minScale: mapLayer.minScale,
          maxScale: mapLayer.maxScale,
          // keep lines below for future reference
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
            // keep lines below for future reference
            // limit: mapLayer.limit,
            // layerId: mapLayer.layerId,
            // serverUrl: mapLayer.serverUrl,
          },
        });
        mapDataLayer.outFields = ["*"];
        mapDataLayer.popupEnabled = false;
        const mapDataLayerId = `${mapDataLayer.layerProperties.layerName}-${mapDataLayer.id}`;
        allMapLayerIds.push(mapDataLayerId);
        featureLayers.push(mapDataLayer);
        map.add(mapDataLayer);
        const minAssetsRequired = parseInt(
          mapDataLayer.layerProperties.minimumAssetsRequired
        );
        const maxAssetsRequired = parseInt(
          mapDataLayer.layerProperties.maximumAssetsRequired
        );

        if (minAssetsRequired === 0) {
          layersWithNoSelectionRequired.push(mapDataLayerId);
        }
        if (layersWithNoSelectionRequired.length === allMapLayerIds.length) {
          isValid = true; 
          console.log("isValid", isValid); 
        } else {
          isValid = false;
          console.log("isValid", isValid);
        }
        renderValidityMessage();

        document.getElementById("layer-data-div").innerHTML += `
          <div class="map-layer-data-container stat-container stat-medium">
            <div class="stat-title">${mapDataLayer.layerProperties.layerName}
              <button class="selectLayers" att-layer-id="${
                mapDataLayer.layerProperties.layerName
              }-${mapDataLayer.id}">
                <span class="glyphicons glyphicons-eye-open "></span>
              </button>
            </div>
            <div>
              <span id="asset-selection-counter"></span>
            </div>
            <div>
              ${
                minAssetsRequired === 0
                  ? `<p id="${mapDataLayerId}-min-asset-required-message" ><span class="label label-success">No asset selection required.</span></p>`
                  : `<p id="${mapDataLayerId}-min-asset-required-message"><span class="label label-error">At least ${minAssetsRequired} required.</span></p>`
              }
              ${
                maxAssetsRequired > 0
                  ? `<p id="${mapDataLayerId}-max-asset-required-message"><span class="label label-default">Select a maximum of ${maxAssetsRequired} assets.</span></p>`
                  : `<p id="${mapDataLayerId}-max-asset-required-message"><span class="label label-default">No upper limit on asset selection.</span></p>`
              }
            </div>
            <ul 
              class="highlighted-asset-data-list" id="${mapDataLayer.layerProperties.layerName}-${mapDataLayer.id}"
              style="list-style-type: none; padding: 0; margin: 0;"
            >
              <li>None selected.</li>
            </ul>
          </div>
        `;
      });
     
      selectFeatureLayer();
      // hit test - for any layer graphics that the click 'hits'
      view.on("click", (event) => {
        view.hitTest(event).then(function (response) {
          if (!response.results[0].layer.layerProperties){
            alert("Please try again. There are no assets to select at that location.")
            return;
          }
          let highlightedSelection;
          if (response.results.length) {
            const graphic = response.results[0].graphic;
            console.log
            const layerProperties = response.results[0].layer.layerProperties;
            const layerAssetIDFieldName = layerProperties.layerAssetIDFieldName;
            const labelMaskValue = eval(
              `"${graphic.layer.layerProperties.labelMask.replace(
                /\{([^}]+)\}/g,
                (match, p1) => `" + graphic.attributes.${p1} + "`
              )}"`
            );
            const layerId = graphic.layer.id;
            if (
              !chosenAssets.find(
                (a) =>
                  a.assetId ===
                  `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
              )
            ) {
              view.whenLayerView(graphic.layer).then(function (layerView) {
                const mapDataLayerId = `${graphic.layer.layerProperties.layerName}-${graphic.layer.id}`;
                const layerAssetMax = layerProperties.maximumAssetsRequired;
                const totalLayerAssetsSelected = chosenAssets.filter(
                  (h) =>
                    h.layerId ===
                    `${graphic.layer.layerProperties.layerName}-${graphic.layer.id}`
                ).length;
                if (
                  layerAssetMax > 0 &&
                  totalLayerAssetsSelected >= layerAssetMax
                ) {
                  document
                    .getElementById(
                      `${mapDataLayerId}-max-asset-required-message`
                    )
                    .classList.remove("label-default");
                  document
                    .getElementById(
                      `${mapDataLayerId}-max-asset-required-message`
                    )
                    .classList.add("label-error");
                  setTimeout(() => {
                    alert(
                      `You have alreay selected the maximum of ${layerAssetMax} assets for ${graphic.layer.layerProperties.layerName}.`
                    );
                    document
                      .getElementById(
                        `${mapDataLayerId}-max-asset-required-message`
                      )
                      .classList.remove("label-error");
                    document
                      .getElementById(
                        `${mapDataLayerId}-max-asset-required-message`
                      )
                      .classList.add("label-default");
                  }, 500);
                  return;
                }
                highlightedSelection = layerView.highlight(graphic);
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
                renderSelectedAssetLabels();
                validateNumberofAssetsSelected();
              });
            } else {
              chosenAssets.forEach(function (asset) {
                if (
                  asset.assetId ===
                  `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
                ) {
                  asset.highlightSelect.remove();
                }
              });
              const hightlightToRemove = chosenAssets.findIndex(
                (a) =>
                  a.assetId ===
                  `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
              );
              chosenAssets.splice(hightlightToRemove, 1);
              renderSelectedAssetLabels();
              validateNumberofAssetsSelected();
              console.log("chosenAssets", chosenAssets);
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
}

function renderSelectedAssetLabels() {
  const selectedLayerAssetListArray = document.querySelectorAll(
    ".highlighted-asset-data-list"
  );
  // Clear existing list items before appending new ones
  selectedLayerAssetListArray.forEach((list) => {
    list.innerHTML = ""; // This clears the list
  });
  chosenAssets.forEach((asset) => {
    selectedLayerAssetListArray.forEach((selectedLayerAssetList) => {
      if (asset.layerId === selectedLayerAssetList.id) {
        const assetLabel = asset.assetLabel;
        const assetLabelListItem = document.createElement("li");
        assetLabelListItem.style.margin = "8px 0";
        
        assetLabelListItem.setAttribute("id", asset.assetId);
        
        assetLabelListItem.innerHTML = `${assetLabel} <button class="pull-right link-button inverse-button red-button remove-asset-btn" style="cursor: pointer;"><span class="glyphicons glyphicons-remove small"></span>Remove</button>
        `;
        selectedLayerAssetList.appendChild(assetLabelListItem);
        assetLabelListItem.addEventListener("click", function () {
          chosenAssets.forEach((asset) => {
            if (
              asset.assetId === assetLabelListItem.id
            ) {
              asset.highlightSelect.remove();
              const listItemToRemove = document.getElementById(
                asset.assetId
              );
              if (listItemToRemove) listItemToRemove.remove();
              const hightlightToRemove = chosenAssets.findIndex(
                (a) =>
                  a.assetId ===
                  asset.assetId
              );
              chosenAssets.splice(hightlightToRemove, 1);
              validateNumberofAssetsSelected();
              console.log("chosenAssets", chosenAssets);
              selectedLayerAssetListArray.forEach((list) => {
                if (list.innerHTML === "") {
                  list.innerHTML = `<li>None selected.</li>`;
                }
              });
            }
          });
        });
      }
    }); 
  });
  selectedLayerAssetListArray.forEach((list) => {
    if (list.innerHTML === "") {
      list.innerHTML = `<li>None selected.</li>`;
    }
  });
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

    const totalLayerAssetsSelected = chosenAssets.filter(
      (asset) =>
        asset.layerId ===
        `${mapLayer.layerProperties.layerName}-${mapLayer.id}`
    ).length;

    if (layerAssetMin === 0 && totalLayerAssetsSelected === 0) {
      document.getElementById(
        `${layerId}-min-asset-required-message`
      ).innerHTML = `No asset selection required.`;
      document
        .getElementById(`${layerId}-min-asset-required-message`)
        .classList.add("label", "label-success");
      isLayerValid = true;
      if (!validLayers.includes(layerId)) {
        validLayers.push(layerId);
      }
    }

    if (layerAssetMin === 0 && totalLayerAssetsSelected > 0) {
      document.getElementById(
        `${layerId}-min-asset-required-message`
      ).innerHTML = `${totalLayerAssetsSelected} selected. None required.`;
      document
        .getElementById(`${layerId}-min-asset-required-message`)
        .classList.add("label", "label-success");
      isLayerValid = true;
      if (!validLayers.includes(layerId)) {
        validLayers.push(layerId);
      }
    }
    
    if (layerAssetMin > 0 && totalLayerAssetsSelected >= layerAssetMin) {
      document.getElementById(
        `${layerId}-min-asset-required-message`
      ).innerHTML = `${totalLayerAssetsSelected} selected. At least ${layerAssetMin} required.`;
      document
        .getElementById(`${layerId}-min-asset-required-message`)
        .classList.add("label", "label-success");
      isLayerValid = true;
      if (!validLayers.includes(layerId)) {
        validLayers.push(layerId);
      }
    }
    if (layerAssetMin >= 0 && totalLayerAssetsSelected < layerAssetMin) {
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
      const layerToRemove = validLayers.findIndex((l) => l === layerId);
      if (layerToRemove !== -1) {
        validLayers.splice(layerToRemove, 1);
      }
    }
    if (layerAssetMax > 0 && totalLayerAssetsSelected === layerAssetMax) {
      document.getElementById(
        `${layerId}-max-asset-required-message`
      ).innerHTML = `Maximum of ${layerAssetMax} reached.`;
    }
    if (layerAssetMax > 0 && totalLayerAssetsSelected < layerAssetMax) {
      document
        .getElementById(`${layerId}-max-asset-required-message`)
        .classList.add("label", "label-default");
      document.getElementById(
        `${layerId}-max-asset-required-message`
      ).innerHTML = `Select a maximum of ${layerAssetMax}.`;
    }
  });
  validateAssetSelection();
  renderValidityMessage();
}

function validateAssetSelection() {
  if (validLayers.length !== allMapLayerIds.length) {
    isValid = false;
  }
  const sortedValidLayers = validLayers.sort();
  const sortedAllMapLayerIds = allMapLayerIds.sort();
  const stringifyValidLayers = JSON.stringify(sortedValidLayers);
  const stringifyAllMapLayerIds = JSON.stringify(sortedAllMapLayerIds);
  if (stringifyValidLayers === stringifyAllMapLayerIds) {
    isValid = true;
  } else {
    isValid = false;
  }
  console.log("isValid", isValid);
 
}

function renderValidityMessage() {
  const validityMessage = document.getElementById("validity-message");
  if (isValid) {
    validityMessage.innerHTML = "Asset selection is valid for submission";
    validityMessage.style.color = "green";
  } else {
    validityMessage.innerHTML =
      "Please make the required asset selections before submission.";
    validityMessage.style.color = "red";
  }
}

initializeMap();
console.log("chosenAssets", chosenAssets);

// define the custom component after the page has loaded
document.addEventListener("DOMContentLoaded", () => {
  customElements.define("gis-asset-chooser", GISAssetChooserComponent);
});
