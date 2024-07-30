// This file holds the logic that provides functionality for the GIS Asset Chooser.
console.log("map builder");
const defaultZoom = "12";
const defaultCenterX = "-90.25";
const defaultCenterY = "38.64";
const defaultBaseMap = "topo-vector";
const defaultShowSearch = true;
const mapLayersToAdd = [];
const featureLayers = [];
const chosenAssets = [];
const allMapLayerIds = [];
const layersWithNoSelectionRequired = [];
const validLayers = [];
let isValid = false;

// functions to build the map and provide functionality for the GIS Asset Chooser
const selectFeatureLayer = () => {
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
            spanElement.classList.remove("glyphicons-eye-close");
            spanElement.classList.add("glyphicons-eye-open");
            spanElement.innerHTML = `<span class="sr-only">show layer</span>`;
          } else {
            outerLayer.visible = true;
            spanElement.classList.remove("glyphicons-eye-open");
            spanElement.classList.add("glyphicons-eye-close");
            spanElement.innerHTML = `<span class="sr-only">hide layer</span>`;
          }
        }
      });
    });
  });
};

const renderSelectedAssetLabels = () => {
  const selectedLayerAssetListArray = document.querySelectorAll(".highlighted-asset-data-list");
  // Clear existing list items before appending new ones
  selectedLayerAssetListArray.forEach(list => {
    list.innerHTML = ""; // This clears the list
  });

  chosenAssets.forEach(asset => {
    selectedLayerAssetListArray.forEach(selectedLayerAssetList => {
      if (asset.layerId === selectedLayerAssetList.id) {
        const assetLabel = asset.assetLabel;
        const assetLabelListItem = document.createElement("li");

        assetLabelListItem.setAttribute("id", asset.internalAssetId);
        assetLabelListItem.innerHTML = `
          ${assetLabel}
          <button
            class="pull-right link-button small-button red-button transparent-button remove-asset-btn"
          >
            <span class="glyphicons glyphicons-remove"></span>
            Remove
          </button>
        `;
        selectedLayerAssetList.appendChild(assetLabelListItem);

        assetLabelListItem.addEventListener("click", () => {
          chosenAssets.forEach(asset => {
            if (asset.internalAssetId === assetLabelListItem.id) {
              asset.highlightSelect.remove();
              const listItemToRemove = document.getElementById(asset.internalAssetId);
              if (listItemToRemove) listItemToRemove.remove();
              const hightlightToRemove = chosenAssets.findIndex(a => a.internalAssetId === asset.internalAssetId);
              chosenAssets.splice(hightlightToRemove, 1);
              validateNumberofAssetsSelected();
              console.log("chosenAssets", chosenAssets);
              selectedLayerAssetListArray.forEach(list => {
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

  selectedLayerAssetListArray.forEach(list => {
    if (list.innerHTML === "") {
      list.innerHTML = `<li>None selected.</li>`;
    }
  });
};

const validateNumberofAssetsSelected = () => {
  featureLayers.forEach(mapLayer => {
    let isLayerValid = false;
    const layerId = `${mapLayer.layerProperties.layerName}-${mapLayer.id}`;
    const layerAssetMin = parseInt(mapLayer.layerProperties.minimumAssetsRequired);
    const layerAssetMax = parseInt(mapLayer.layerProperties.maximumAssetsRequired);

    const totalLayerAssetsSelected = chosenAssets.filter(
      asset => asset.layerId === `${mapLayer.layerProperties.layerName}-${mapLayer.id}`
    ).length;

    const minAssetMessageElement = document.getElementById(`${layerId}-min-asset-required-message`);
    const maxAssetMessageElement = document.getElementById(`${layerId}-max-asset-required-message`);

    if (layerAssetMin === 0 && totalLayerAssetsSelected === 0) {
      minAssetMessageElement.innerHTML = `No selection required.`;
      minAssetMessageElement.classList.add("label", "label-success");
      isLayerValid = true;
      if (!validLayers.includes(layerId)) validLayers.push(layerId);
    }

    if (layerAssetMin === 0 && totalLayerAssetsSelected > 0) {
      minAssetMessageElement.innerHTML = `${totalLayerAssetsSelected} selected. None required.`;
      minAssetMessageElement.classList.add("label", "label-success");
      isLayerValid = true;
      if (!validLayers.includes(layerId)) validLayers.push(layerId);
    }

    if (layerAssetMin > 0 && totalLayerAssetsSelected >= layerAssetMin) {
      minAssetMessageElement.innerHTML = `${totalLayerAssetsSelected} selected. At least ${layerAssetMin} required.`;
      minAssetMessageElement.classList.add("label", "label-success");
      minAssetMessageElement.classList.remove("label-error");
      isLayerValid = true;
      if (!validLayers.includes(layerId)) validLayers.push(layerId);
    }

    if (layerAssetMin >= 0 && totalLayerAssetsSelected < layerAssetMin) {
      minAssetMessageElement.innerHTML = `At least ${layerAssetMin} required.`;
      minAssetMessageElement.classList.remove("label", "label-success");
      minAssetMessageElement.classList.add("label", "label-error");
      isLayerValid = false;
      const layerToRemove = validLayers.findIndex(l => l === layerId);
      if (layerToRemove !== -1) validLayers.splice(layerToRemove, 1);
    }

    if (layerAssetMax > 0 && totalLayerAssetsSelected === layerAssetMax) {
      maxAssetMessageElement.innerHTML = `Maximum of ${layerAssetMax} reached.`;
    }

    if (layerAssetMax > 0 && totalLayerAssetsSelected < layerAssetMax) {
      maxAssetMessageElement.classList.add("label", "label-default");
      maxAssetMessageElement.innerHTML = `Select a maximum of ${layerAssetMax}.`;
    }
  });

  validateAssetSelection();
  renderValidityMessage();
};

const validateAssetSelection = () => {
  if (validLayers.length !== allMapLayerIds.length) {
    isValid = false;
  }
  const sortedValidLayers = [...validLayers].sort();
  const sortedAllMapLayerIds = [...allMapLayerIds].sort();
  const stringifyValidLayers = JSON.stringify(sortedValidLayers);
  const stringifyAllMapLayerIds = JSON.stringify(sortedAllMapLayerIds);
  if (stringifyValidLayers === stringifyAllMapLayerIds) {
    isValid = true;
    // Dispatch the chosenAssets to the parent application when isValid is true
    dispatchChosenAssets(chosenAssets);
  } else {
    isValid = false;
    // Secure the chosenAssets from parent application when isValid is false
    secureChosenAssets();
  }
  console.log("isValid", isValid);
};

const renderValidityMessage = () => {
  const validityMessage = document.getElementById("validity-message");
  let makeMinimunRequireMessage = `Please select `;

  if (isValid) {
    validityMessage.innerHTML = "Asset selection is valid for submission";
    validityMessage.classList.add("label", "label-success");
  } else {
    validityMessage.classList.remove("label", "label-success");

    featureLayers.forEach(mapLayer => {
      const layerAssetMin = parseInt(mapLayer.layerProperties.minimumAssetsRequired);
      const totalLayerAssetsSelected = chosenAssets.filter(
        asset => asset.layerId === `${mapLayer.layerProperties.layerName}-${mapLayer.id}`
      ).length;

      if (layerAssetMin >= 0 && totalLayerAssetsSelected < layerAssetMin) {
        makeMinimunRequireMessage += `at least <span class="label label-error"><strong>${layerAssetMin} from ${mapLayer.layerProperties.layerName}</strong></span>, `;
      }

      if (layerAssetMin >= 0 && totalLayerAssetsSelected >= layerAssetMin) {
        makeMinimunRequireMessage += `at least <span class="label label-success"><strong>${layerAssetMin} from ${mapLayer.layerProperties.layerName}</strong></span>, `;
      }
    });

    // Remove the last comma and space if present
    if (makeMinimunRequireMessage.endsWith(", ")) {
      makeMinimunRequireMessage = makeMinimunRequireMessage.slice(0, -2);
    }

    // Replace the last comma with ' and '
    const lastCommaIndex = makeMinimunRequireMessage.lastIndexOf(", ");
    if (lastCommaIndex !== -1) {
      makeMinimunRequireMessage = `${makeMinimunRequireMessage.substring(0, lastCommaIndex)} and ${makeMinimunRequireMessage.substring(lastCommaIndex + 2)}`;
    }

    makeMinimunRequireMessage = makeMinimunRequireMessage.replace(
      /at least (\d+ \w+)/g,
      "at least <strong>$1</strong>"
    );

    validityMessage.innerHTML = `${makeMinimunRequireMessage}.`;
  }
};

// Dispatch the chosenAssets to the parent application
const dispatchChosenAssets = chosenAssets => {
  const event = new CustomEvent("isValidTrue", { detail: { chosenAssets } });
  document.dispatchEvent(event);
};

// custom event listener to signal when chosenAssets are not valid
const secureChosenAssets = () => {
  const event = new CustomEvent("isValidFalse", { detail: { isValid } });
  document.dispatchEvent(event);
};

// event listener to capture layer data from map-layer.js
const captureMapLayers = () => {
  document.addEventListener("layerDetailsProvided", (event) => {
    const mapLayer = event.detail;
    mapLayersToAdd.push(mapLayer);
  });
};
captureMapLayers();

// initilize the map using the map layers provided
const initializeMap = () => {
  console.log("initializeMap function runs");
  console.log("chosenAssets", chosenAssets);
  try {
    const zoom = document.querySelector("asset-chooser-container").getAttribute("zoom") || defaultZoom;
    const baseMap = document.querySelector("asset-chooser-container").getAttribute("baseMap") || defaultBaseMap;
    const centerX = document.querySelector("asset-chooser-container").getAttribute("centerX") || defaultCenterX;
    const centerY = document.querySelector("asset-chooser-container").getAttribute("centerY") || defaultCenterY;
    const showSearch = document.querySelector("asset-chooser-container").getAttribute("show-search") || defaultShowSearch;
    console.log("showSearch", showSearch);
    require([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/FeatureLayer",
      "esri/widgets/Search",
    ], (Map, MapView, FeatureLayer, Search) => {
      const map = new Map({ basemap: baseMap });

      const view = new MapView({
        map: map,
        center: [centerX, centerY],
        zoom: zoom,
        container: document.querySelector("#viewDiv"),
      });

      if (showSearch) {
        const searchWidget = new Search({ view: view });
        view.ui.add(searchWidget, { position: "top-right" });
      }

      mapLayersToAdd.forEach((mapLayer) => {
        const mapDataLayer = new FeatureLayer({
          url: mapLayer.layerClassUrl,
          minScale: mapLayer.minScale,
          maxScale: mapLayer.maxScale,
          layerProperties: {
            layerName: mapLayer.name,
            layerClassUrl: mapLayer.layerClassUrl,
            layerAssetIDFieldName: mapLayer.layerAssetIDFieldName,
            labelMask: mapLayer.labelMask,
            required: mapLayer.required,
            minimumAssetsRequired: mapLayer.minimumSelections,
            maximumAssetsRequired: mapLayer.maximumSelections,
            minScale: mapLayer.minScale,
            maxScale: mapLayer.maxScale,
          },
        });
        mapDataLayer.outFields = ["*"];
        mapDataLayer.popupEnabled = false;
        const mapDataLayerId = `${mapDataLayer.layerProperties.layerName}-${mapDataLayer.id}`;
        allMapLayerIds.push(mapDataLayerId);
        featureLayers.push(mapDataLayer);
        map.add(mapDataLayer);
        const minAssetsRequired = parseInt(mapDataLayer.layerProperties.minimumAssetsRequired);
        const maxAssetsRequired = parseInt(mapDataLayer.layerProperties.maximumAssetsRequired);

        if (minAssetsRequired === 0) {
          layersWithNoSelectionRequired.push(mapDataLayerId);
        }
        if (layersWithNoSelectionRequired.length === allMapLayerIds.length) {
          isValid = true;
          console.log("isValid", isValid);
          dispatchChosenAssets(chosenAssets);
        } else {
          isValid = false;
          console.log("isValid", isValid);
          secureChosenAssets();
        }
        renderValidityMessage();

        document.getElementById("layer-data-div").innerHTML += `
          <div class="map-layer-data-container stat-container stat-medium">
            <div class="stat-title">
              <span>
                <strong>${mapDataLayer.layerProperties.layerName}</strong>
              </span>
              <button class="selectLayers" att-layer-id="${mapDataLayer.layerProperties.layerName}-${mapDataLayer.id}">
                <span class="glyphicons glyphicons-eye-close">
                  <span class="sr-only">hide layer</span>
                </span>
              </button>
            </div>
            <div>
              ${minAssetsRequired === 0
                ? `<span id="${mapDataLayerId}-min-asset-required-message"><span class="label label-success">No selection required.</span></span>`
                : `<span id="${mapDataLayerId}-min-asset-required-message"><span class="label label-error">At least ${minAssetsRequired} required.</span></span>`}
              ${maxAssetsRequired > 0
                ? `<span id="${mapDataLayerId}-max-asset-required-message"><span class="label label-default">Select a maximum of ${maxAssetsRequired}.</span></span>`
                : ``}
            </div>
            <ul class="list-group highlighted-asset-data-list" id="${mapDataLayer.layerProperties.layerName}-${mapDataLayer.id}">
              <li>None selected.</li>
            </ul>
          </div>
        `;
      });

      selectFeatureLayer();
      view.on("click", (event) => {
        view.hitTest(event).then((response) => {
          if (!response.results[0].layer.layerProperties) {
            alert("Please try again. There are no assets to select at that location.");
            return;
          }
          let highlightedSelection;
          if (response.results.length) {
            const graphic = response.results[0].graphic;
            const layerProperties = response.results[0].layer.layerProperties;
            const layerAssetIDFieldName = layerProperties.layerAssetIDFieldName;
            const labelMaskValue = eval(`"${graphic.layer.layerProperties.labelMask.replace(/\{([^}]+)\}/g, (match, p1) => `" + graphic.attributes.${p1} + "`)}"`);
            console.log("graphic:", graphic);
            const layerId = graphic.layer.id;
            if (!chosenAssets.find((a) => a.internalAssetId === `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`)) {
              view.whenLayerView(graphic.layer).then((layerView) => {
                const mapDataLayerId = `${graphic.layer.layerProperties.layerName}-${graphic.layer.id}`;
                const layerAssetMax = layerProperties.maximumAssetsRequired;
                const totalLayerAssetsSelected = chosenAssets.filter((h) => h.layerId === `${graphic.layer.layerProperties.layerName}-${graphic.layer.id}`).length;
                if (layerAssetMax > 0 && totalLayerAssetsSelected >= layerAssetMax) {
                  document.getElementById(`${mapDataLayerId}-max-asset-required-message`).classList.remove("label-default");
                  document.getElementById(`${mapDataLayerId}-max-asset-required-message`).classList.add("label-error");
                  setTimeout(() => {
                    alert(`You have already selected the maximum of ${layerAssetMax} assets for ${graphic.layer.layerProperties.layerName}.`);
                    document.getElementById(`${mapDataLayerId}-max-asset-required-message`).classList.remove("label-error");
                    document.getElementById(`${mapDataLayerId}-max-asset-required-message`).classList.add("label-default");
                  }, 500);
                  return;
                }
                highlightedSelection = layerView.highlight(graphic);
                const chosenAsset = {
                  assetAttributes: graphic.attributes,
                  internalAssetId: `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`,
                  assetId: graphic.attributes.GUID,
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
              chosenAssets.forEach((asset) => {
                if (asset.internalAssetId === `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`) {
                  asset.highlightSelect.remove();
                }
              });
              const hightlightToRemove = chosenAssets.findIndex((a) => a.internalAssetId === `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`);
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
};

initializeMap();
