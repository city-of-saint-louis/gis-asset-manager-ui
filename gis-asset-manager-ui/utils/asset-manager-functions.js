// import state variables from asset-manager-state.js
import {
  chosenAssets,
  createdAssets,
  allMapLayerIds,
  mapLayersToAdd,
  featureLayers,
  graphicLayers,
  chosenAssetFormData,
  createdAssetFormData,
  layersWithNoSelectionRequired,
  validLayers,
  currentView,
  setCurrentView,
  isValid,
  // createdAssetsAreValid,
  setIsValid,
  // isSelectBySearchEnabled,
  // setIsSelectEnabled,
  // setIsSketchEnabled,
  // assetMode,
  // setAssetMode,
} from "../asset-manager-state.js";

import { getCreatedAssetsAreValid } from "../asset-manager-state.js";

// *** begin map related functions *** //
// destroy the previous map view
export const destroyPreviousMapView = () => {
  if (currentView) {
    currentView.destroy();
    setCurrentView(null);
  }
  // Remove any existing <arcgis-map> from #viewDiv
  const viewDiv = document.querySelector("#viewDiv");
  if (viewDiv) {
    const oldArcgisMap = viewDiv.querySelector("arcgis-map");
    if (oldArcgisMap) {
      viewDiv.removeChild(oldArcgisMap);
    }
    viewDiv.innerHTML = "";
  }
};

// clear the map data
export const clearMapData = () => {
  // empty the stored featureLayers array
  featureLayers.splice(0, featureLayers.length);
  // empty the stored graphicLayers array
  graphicLayers.splice(0, graphicLayers.length);
  // empty the stored chosenAssets array
  chosenAssets.splice(0, chosenAssets.length);
  // empty the stored createdAssets array
  createdAssets.splice(0, createdAssets.length);
  // empty the stored chosenAssetFormData array
  chosenAssetFormData.splice(0, chosenAssetFormData.length);
  // empty the stored createdAssetFormData array
  createdAssetFormData.splice(0, createdAssetFormData.length);
  // empty the stored allMapLayerIds array
  allMapLayerIds.splice(0, allMapLayerIds.length);
  // empty the stored layersWithNoSelectionRequired array
  layersWithNoSelectionRequired.splice(0, layersWithNoSelectionRequired.length);
  // empty the stored validLayers array
  validLayers.splice(0, validLayers.length);
};

// event listener to capture layer data from map-layer.js
export const captureMapLayers = () => {
  document.addEventListener("layerDetailsProvided", (event) => {
    const mapLayer = event.detail;
    mapLayersToAdd.push(mapLayer);
  });
};

// --- UPDATED: hideOrShowLayer only toggles visibility ---
export const hideOrShowLayer = (layerName) => {
  // Find the correct layer by name
  const layer = featureLayers.find(
    (l) => l.layerProperties.layerName === layerName
  );
  if (layer) {
    layer.visible = !layer.visible;
    // UI will be updated by monitorLayerVisibility calling updateVisibility
  }
};

// add map layers to the map
export const addMapLayer = ({
  mapLayer,
  FeatureLayer,
  reactiveUtils,
  map,
  view,
  allMapLayerIds,
  featureLayers,
  layersWithNoSelectionRequired,
}) => {
  const layerMinScale = parseInt(mapLayer.minScale, 10) || 0;
  const layerMaxScale = parseInt(mapLayer.maxScale, 10) || 0;
  const isSelectBySearchEnabled = mapLayer.isSelectBySearchEnabled;
  const mapDataLayer = new FeatureLayer({
    url: mapLayer.layerClassUrl,
    minScale: mapLayer.minScale,
    maxScale: mapLayer.maxScale,
    layerProperties: {
      layerName: mapLayer.name,
      formattedLayerName: mapLayer.name.replace(/[-]/g, " "),
      layerClassUrl: mapLayer.layerClassUrl,
      layerAssetIDFieldName: mapLayer.layerAssetIDFieldName,
      labelMask: mapLayer.labelMask,
      minAssetsRequired: mapLayer.minimumSelectionsRequired,
      maxAssetsAllowed: mapLayer.maximumSelectionsAllowed,
      minScale: layerMinScale,
      maxScale: layerMaxScale,
      isSelectBySearchEnabled
      // searchFields: [mapLayer.labelMask],
      // displayField: mapLayer.labelMask,
    },
    // labelingInfo: [
    //   {
    //     labelExpressionInfo: {
    //       expression: `$feature.${mapLayer.assetLabel}`,
    //     },
    //     symbol: {
    //       type: "text",
    //       color: "#1e526b",
    //       haloColor: "white",
    //       haloSize: "1px",
    //       font: {
    //         family: "Arial Unicode MS",
    //         size: 12,
    //         weight: "bold",
    //       },
    //     },
    //     placement:
    //       mapLayer.geometryType === "polyline"
    //         ? "center-along"
    //         : mapLayer.geometryType === "polygon"
    //         ? "always-horizontal"
    //         : mapLayer.geometryType === "point"
    //         ? "center-center"
    //         : "always-horizontal", // Fallback
    //   },
    // ],
  });
  mapDataLayer.outFields = ["*"];
  mapDataLayer.popupEnabled = false;

  const mapDataLayerId = `${mapDataLayer.layerProperties.layerName}-${mapDataLayer.id}`;
  mapDataLayer.id = mapDataLayerId;
  allMapLayerIds.push(mapDataLayerId);
  featureLayers.push(mapDataLayer);

  map.add(mapDataLayer);
  const layerName = mapDataLayer.layerProperties.layerName;
  const formattedLayerName = mapDataLayer.layerProperties.formattedLayerName;
  const minAssetsRequired = parseInt(
    mapDataLayer.layerProperties.minAssetsRequired
  );
  const maxAssetsAllowed = parseInt(
    mapDataLayer.layerProperties.maxAssetsAllowed
  );
  // const layerMinScale = mapDataLayer.minScale;
  if (minAssetsRequired === 0) {
    layersWithNoSelectionRequired.push(mapDataLayerId);
  }
  // const layerMaxScale = mapDataLayer.maxScale;
  // const layerDataDiv = document.getElementById("layer-data-div");
  const layerDataContainer = document.getElementById("layer-data-container");
  layerDataContainer.classList.add("stat-group");

  view.on("layerview-create", function (event) {
    if (event.layer === mapDataLayer) {
      monitorLayerVisibility(
        reactiveUtils,
        event.layerView,
        mapDataLayer,
        layerName,
        formattedLayerName,
        layerMinScale,
        layerMaxScale
      );
    }
  });

  const mapLayerDataDisplay = document.createElement(
    "asset-manager-map-layer-data-display"
  );
  mapLayerDataDisplay.setAttribute("data-layer-id", mapDataLayerId);
  // mapLayerDataDisplay.classList.add("col-sm-6", "col-lg-4");
  mapLayerDataDisplay.data = {
    layerName,
    formattedLayerName,
    mapDataLayerId,
    minAssetsRequired,
    maxAssetsAllowed,
    layerMinScale,
    layerMaxScale,
    showHideHandler: hideOrShowLayer,
    isSketchable: false,
    view,
    layer: mapDataLayer,
  };
  // console.log("mapLayerDataDisplay.data", mapLayerDataDisplay.data);
  // layerDataDiv.appendChild(mapLayerDataDisplay);
  layerDataContainer.appendChild(mapLayerDataDisplay);
};

export const monitorLayerVisibility = (
  reactiveUtils,
  layerView,
  mapDataLayer,
  layerName,
  formattedLayerName,
  layerMinScale,
  layerMaxScale
) => {
  // Watch visibleAtCurrentScale (zoom/scale)
  reactiveUtils.watch(
    () => layerView.visibleAtCurrentScale,
    // (visibleAtCurrentScale) => {
    () => {
      updateLayerDisplay();
    }
  );
  // Watch visible property (show/hide)
  reactiveUtils.watch(
    () => mapDataLayer.visible,
    // (visible) => {
    () => {
      updateLayerDisplay();
    }
  );

  function updateLayerDisplay() {
    const allDisplays = document.querySelectorAll(
      "asset-manager-map-layer-data-display"
    );
    let mapLayerDataDisplay = null;
    allDisplays.forEach((display) => {
      if (
        display.data &&
        (display.data.layerName === layerName ||
          display.data.formattedLayerName === formattedLayerName)
      ) {
        mapLayerDataDisplay = display;
      }
    });

    if (
      mapLayerDataDisplay &&
      typeof mapLayerDataDisplay.updateVisibility === "function"
    ) {
      mapLayerDataDisplay.updateVisibility({
        visibleAtCurrentScale: layerView.visibleAtCurrentScale,
        visible: mapDataLayer.visible,
        formattedLayerName,
        layerMinScale,
        layerMaxScale,
      });
    }
  }
};
// *** end map related functions *** //

// *** begin asset related functions *** //
// exported functions
// render the validity message for asset selection based on assets selected
export const renderValidityMessage = () => {
  const createdAssetsAreValid = getCreatedAssetsAreValid();
  // console.log(
  //   "Rendering validity message...",
  //   "isValid",
  //   isValid,
  //   "createdAssetsAreValid",
  //   createdAssetsAreValid
  // );
  // const validityMessage = document.getElementById("validity-message");
  const validityMessage = document.getElementById("asset-manager-hint");
  const originalHintText = validityMessage.getAttribute("data-original-hint");
  const mapContainer = document.getElementById("viewDiv");
  const mapLayerDataContainers = document.querySelectorAll(
    ".map-layer-data-container"
  );
  if (isValid && createdAssetsAreValid) {
    validityMessage.innerHTML = `<span class="label label-success">Assets valid for submission</span>`;
    validityMessage.setAttribute("aria-live", "assertive");
    validityMessage.setAttribute("title", "Assets valid for submission");
    mapContainer.classList.remove(
      "select-shadow",
      "select-border",
      "sketch-shadow",
      "sketch-border"
    );
    mapContainer.classList.add("assets-valid-shadow", "assets-valid-border");
    // mapLayerDataContainers.forEach((container) => {
    //   container.classList.remove("select-shadow", "sketch-shadow");
    // });
    mapLayerDataContainers.forEach((container) => {
      container.classList.add("assets-valid-shadow", "assets-valid-border");
    });
    // setIsSelectEnabled(false);
    // setIsSketchEnabled(false);
    // setAssetMode('');
  } else {
    validityMessage.removeAttribute("aria-live");
    validityMessage.textContent = originalHintText;
    mapContainer.classList.remove("assets-valid-shadow", "assets-valid-border");
    mapLayerDataContainers.forEach((container) => {
      container.classList.remove("assets-valid-shadow", "assets-valid-border");
    });
  }
};

// dispatch the chosenAssets to the parent application
export const dispatchChosenAssets = (chosenAssets) => {
  const event = new CustomEvent("isValidTrue", {
    detail: { chosenAssets, chosenAssetFormData: [] },
  });
  document.dispatchEvent(event);
};

// custom event listener to signal when chosenAssets are not valid
export const secureChosenAssets = () => {
  const event = new CustomEvent("isValidFalse", { detail: { isValid } });
  document.dispatchEvent(event);
};

// highlight and handle a selected asset
export const highlightSelectedAsset = (
  response,
  view,
  highlightedSelection
) => {
  const graphic = response.results[0].graphic;
  // console.log("Graphic selected:", graphic);
  const layerProperties = response.results[0].layer.layerProperties;
  const layerAssetIDFieldName = layerProperties.layerAssetIDFieldName;
  const layerName = graphic.layer.layerProperties.layerName;
  const formattedLayerName = graphic.layer.layerProperties.formattedLayerName;
  const labelMaskValue = graphic.layer.layerProperties.labelMask.replace(
  /\{([^}]+)\}/g,
  (match, p1) => graphic.attributes[p1] ?? ""
);
  const layerId = graphic.layer.id;
  if (
    !chosenAssets.find(
      (a) =>
        a.internalAssetId ===
        `${layerName}-${graphic.attributes[layerAssetIDFieldName]}`
    )
  ) {
    view.whenLayerView(graphic.layer).then((layerView) => {
      const mapDataLayerId = `${graphic.layer.id}`;
      const layerAssetMax = layerProperties.maxAssetsAllowed;
      const totalLayerAssetsSelected = chosenAssets.filter(
        (h) => h.layerId === `${graphic.layer.id}`
      ).length;
      if (layerAssetMax > 0 && totalLayerAssetsSelected >= layerAssetMax) {
        document
          .getElementById(`${mapDataLayerId}-max-asset-allowed-message`)
          .classList.remove("label-default");
        document
          .getElementById(`${mapDataLayerId}-max-asset-allowed-message`)
          .classList.add("label-error");
        setTimeout(() => {
          alert(
            `You have already selected the maximum of ${layerAssetMax} asset(s) from the ${formattedLayerName} layer.`
          );
          document
            .getElementById(`${mapDataLayerId}-max-asset-allowed-message`)
            .classList.remove("label-error");
          document
            .getElementById(`${mapDataLayerId}-max-asset-allowed-message`)
            .classList.add("label-default");
        }, 500);
        return;
      }
      highlightedSelection = layerView.highlight(graphic);
      // console.log("Asset highlighted by click:", highlightedSelection);
      const chosenAsset = {
        assetAttributes: graphic.attributes,
        internalAssetId: `${layerName}-${graphic.attributes[layerAssetIDFieldName]}`,
        assetId: `${graphic.attributes[layerAssetIDFieldName]}`,
        objectId: graphic.attributes.OBJECTID,
        assetIdType: layerAssetIDFieldName,
        assetLabel: labelMaskValue,
        assetType: graphic.layer.layerProperties.layerName,
        layerData: graphic.layer,
        layerId: `${layerId}`,
        layerName: layerName,
        layerTitle: graphic.layer.title,
        layerClassUrl: graphic.layer.layerProperties.layerClassUrl,
        layerAssetMax: graphic.layer.layerProperties.maxAssetsAllowed,
        highlightSelect: highlightedSelection,
        graphic: graphic,
      };
      // console.log("Chosen asset added:", chosenAsset);
      chosenAssets.push(chosenAsset);
      // console.log("chosenAssets array:", chosenAssets);
      renderSelectedAssetLabels();
      validateLayerSelections();
    });
  } else {
    chosenAssets.forEach((asset) => {
      if (
        asset.internalAssetId ===
        `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
      ) {
        asset.highlightSelect.remove();
      }
    });
    const hightlightToRemove = chosenAssets.findIndex(
      (a) =>
        a.internalAssetId ===
        `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
    );
    chosenAssets.splice(hightlightToRemove, 1);
    renderSelectedAssetLabels();
    validateLayerSelections();
  }
};

// render information about the assets that have been selected
// used in highlightSelectedAsset function, no need to export
export const renderSelectedAssetLabels = () => {
  // console.log('chosenAssets:', chosenAssets);
  const selectedLayerAssetListArray = document.querySelectorAll(
    ".chosen-asset-data-list"
  );
  // Clear existing list items before appending new ones
  selectedLayerAssetListArray.forEach((list) => {
    list.innerHTML = "";
  });
  chosenAssets.forEach((asset) => {
    // console.log("Rendering asset label for:", asset);
    selectedLayerAssetListArray.forEach((selectedLayerAssetList) => {
      if (asset.layerId === selectedLayerAssetList.id) {
        let assetLabel = asset.assetLabel;
        // if (
        //   asset.assetAttributes.RoadType &&
        //   asset.assetAttributes.RoadType === "Alley"
        // ) {
        //   assetLabel = `Alley`;
        // };
        // if (assetLabel.includes("0 to 0") && asset.assetAttributes.RoadType !== "Interstate") {
        //   assetLabel = "Alley";
        // };
        // if (assetLabel.includes("0 to 0") && asset.assetAttributes.RoadType === "Interstate") {
        //   // filter and remove "0 to 0" from interstate labels
        //   assetLabel = assetLabel.replace("0 to 0", "").trim();
        // };
        if (assetLabel.includes("null")) {
          assetLabel = "Asset data unavailable";
        }
        const arcGisMap = document.querySelector("arcgis-map");
        const view = arcGisMap.view;
        const assetLabelListItem = document.createElement("li");
        assetLabelListItem.setAttribute("id", asset.internalAssetId);

        // Create the label span
        const assetLabelTextSpan = document.createElement("span");
        assetLabelTextSpan.className = "asset-label-text";
        assetLabelTextSpan.title = `You have selected ${assetLabel}`;
        assetLabelTextSpan.id = `label-${asset.internalAssetId}`;
        assetLabelTextSpan.textContent = assetLabel;
        assetLabelTextSpan.classList.add("asset-list-item-content-span");

        // Add the click handler
        assetLabelTextSpan.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          view.goTo({
            target: asset.graphic.geometry,
            zoom: 18,
          });
        });

        // Add the label span to the list item
        assetLabelListItem.appendChild(assetLabelTextSpan);

        // add the remove button
        const removeAssetBtn = document.createElement("button");
        removeAssetBtn.type = "button";
        removeAssetBtn.id = `remove-${asset.internalAssetId}-btn`;
        removeAssetBtn.className =
          "pull-right link-button small-button red-button transparent-button remove-asset-btn";
        removeAssetBtn.title = `Remove ${assetLabel}`;
        // removeAssetBtn.innerHTML = `<span class="remove-button-text">Remove</span> `;
        const removeIcon = document.createElement("calcite-icon");
        removeIcon.setAttribute("icon", "x-circle");
        removeIcon.setAttribute("scale", "s");
        removeAssetBtn.appendChild(removeIcon);

        const removeButtonTextSpan = document.createElement("span");
        removeButtonTextSpan.className = "remove-button-text";
        removeButtonTextSpan.textContent = "Remove";
        removeAssetBtn.appendChild(removeButtonTextSpan);

        assetLabelListItem.appendChild(removeAssetBtn);
        selectedLayerAssetList.appendChild(assetLabelListItem);

        removeAssetBtn.addEventListener("click", () => {
          renderValidityMessage();
          chosenAssets.forEach((asset) => {
            const formattedLayerName =
              asset.layerData.layerProperties.formattedLayerName;
            if (asset.internalAssetId === assetLabelListItem.id) {
              asset.highlightSelect.remove();
              const listItemToRemove = document.getElementById(
                asset.internalAssetId
              );
              if (listItemToRemove) listItemToRemove.remove();
              const hightlightToRemove = chosenAssets.findIndex(
                (a) => a.internalAssetId === asset.internalAssetId
              );
              chosenAssets.splice(hightlightToRemove, 1);
              validateLayerSelections();
              selectedLayerAssetListArray.forEach((list) => {
                if (list.innerHTML === "") {
                  list.innerHTML = `<li title="No assets selected from ${formattedLayerName} layer">None selected</li>`;
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
      list.innerHTML = `<li title="No assets selected from ${list.dataset.layerName.replace(
        /-/g,
        " "
      )} layer">None selected</li>`;
    }
  });
};

// validation functions / not exported
// validate asset selection for each individual layer, used in highlightSelectedAsset function
export const validateLayerSelections = () => {
  featureLayers.forEach((mapLayer) => {
    // console.log("Validating layer selections for:", mapLayer);
    // const layerId = `${mapLayer.layerProperties.layerName}-${mapLayer.id}`;
    const layerId = mapLayer.id;
    const layerAssetMin = parseInt(mapLayer.layerProperties.minAssetsRequired);
    const layerAssetMax = parseInt(mapLayer.layerProperties.maxAssetsAllowed);
    const totalLayerAssetsSelected = chosenAssets.filter(
      (asset) => asset.layerId === `${mapLayer.id}`
    ).length;
    const minAssetMessageElement = document.getElementById(
      `${layerId}-min-asset-required-message`
    );
    const maxAssetMessageElement = document.getElementById(
      `${layerId}-max-asset-allowed-message`
    );
    if (layerAssetMin === 0 && totalLayerAssetsSelected === 0) {
      minAssetMessageElement.innerHTML = `0 required.`;
      minAssetMessageElement.classList.add("label", "label-success");
      if (!validLayers.includes(layerId)) validLayers.push(layerId);
    }
    if (layerAssetMin === 0 && totalLayerAssetsSelected > 0) {
      minAssetMessageElement.innerHTML = `${totalLayerAssetsSelected} selected. 0 required`;
      minAssetMessageElement.classList.add("label", "label-success");
      if (!validLayers.includes(layerId)) validLayers.push(layerId);
    }
    if (layerAssetMin > 0 && totalLayerAssetsSelected >= layerAssetMin) {
      minAssetMessageElement.innerHTML = `${totalLayerAssetsSelected} selected. ${layerAssetMin} required.`;
      minAssetMessageElement.classList.add("label", "label-success");
      minAssetMessageElement.classList.remove("label-error");
      if (!validLayers.includes(layerId)) validLayers.push(layerId);
    }
    if (layerAssetMin === 1 && totalLayerAssetsSelected === layerAssetMin) {
      minAssetMessageElement.innerHTML = `${totalLayerAssetsSelected} selected. ${layerAssetMin} required.`;
      minAssetMessageElement.classList.add("label", "label-success");
      minAssetMessageElement.classList.remove("label-error");
      if (!validLayers.includes(layerId)) validLayers.push(layerId);
    }
    if (layerAssetMin === 1 && totalLayerAssetsSelected < layerAssetMin) {
      minAssetMessageElement.innerHTML = `${layerAssetMin} required.`;
      minAssetMessageElement.classList.remove("label", "label-success");
      minAssetMessageElement.classList.add("label", "label-error");
      const layerToRemove = validLayers.findIndex((l) => l === layerId);
      if (layerToRemove !== -1) validLayers.splice(layerToRemove, 1);
    }
    if (layerAssetMin > 1 && totalLayerAssetsSelected < layerAssetMin) {
      minAssetMessageElement.innerHTML = `At least ${layerAssetMin} required.`;
      minAssetMessageElement.classList.remove("label", "label-success");
      minAssetMessageElement.classList.add("label", "label-error");
      const layerToRemove = validLayers.findIndex((l) => l === layerId);
      if (layerToRemove !== -1) validLayers.splice(layerToRemove, 1);
    }
    if (layerAssetMax > 0 && totalLayerAssetsSelected === layerAssetMax) {
      maxAssetMessageElement.innerHTML = `Maximum of ${layerAssetMax} reached.`;
      maxAssetMessageElement.classList.add("label", "label-default");
    }
    if (layerAssetMax > 0 && totalLayerAssetsSelected < layerAssetMax) {
      maxAssetMessageElement.classList.add("label", "label-default");
      maxAssetMessageElement.innerHTML = `${layerAssetMax} maximum.`;
    }
  });
  validateAssetSelection();
};

// validate total asset selection for all layers, used in validateLayerSelection function
const validateAssetSelection = () => {
  if (validLayers.length !== allMapLayerIds.length) {
    setIsValid(false);
  }
  const sortedValidLayers = [...validLayers].sort();
  const sortedAllMapLayerIds = [...allMapLayerIds].sort();
  const stringifyValidLayers = JSON.stringify(sortedValidLayers);
  const stringifyAllMapLayerIds = JSON.stringify(sortedAllMapLayerIds);
  if (stringifyValidLayers === stringifyAllMapLayerIds) {
    setIsValid(true);
    // Dispatch the chosenAssets to the parent application when isValid is true
    dispatchChosenAssets(chosenAssets);
  } else {
    setIsValid(false);
    // Secure the chosenAssets from parent application when isValid is false
    secureChosenAssets();
  }
  renderValidityMessage();
};

const injectMapSurfaceFocusStyle = () => {
  // Find the ArcGIS map widget's shadow root
  const arcgisMapWidget = document.querySelector("arcgis-map");
  if (!arcgisMapWidget) return;

  // Find the shadow root
  const shadowRoot = arcgisMapWidget.shadowRoot;
  if (!shadowRoot) return;

  // Find the .esri-view-surface element inside the shadow DOM
  const viewSurface = shadowRoot.querySelector(".esri-view-surface");
  if (!viewSurface) return;

  // Create a style element to override the ::after focus indicator
  const style = document.createElement("style");
  style.textContent = `
    .esri-view-surface:focus::after {
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
      background: none !important;
      /* Or add your custom styling here */
    }
  `;
  // Append the style to the shadow root
  shadowRoot.appendChild(style);
};

export const handleSelectEnabled = () => {
  const enableSelectModeButton = document.getElementById("select-mode-button");
  if (enableSelectModeButton) {
    enableSelectModeButton.setAttribute("disabled", "true");
    enableSelectModeButton.classList.add("disabled-button");
  }
  
  const sketchModeButton = document.getElementById("sketch-mode-button");
  if (sketchModeButton) {
    sketchModeButton.removeAttribute("disabled");
    sketchModeButton.classList.remove("disabled-button");
  }

  // console.log("featureLayers:", featureLayers);
  const selectableLayerNames = featureLayers.map(
    (layer) => layer.layerProperties.layerName
  );
  // console.log("selectableLayerNames:", selectableLayerNames);

  let formattedSelectableLayerNames = selectableLayerNames.map(
    (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  );
  if (formattedSelectableLayerNames.length === 2) {
    formattedSelectableLayerNames = formattedSelectableLayerNames.join(" and ");
  } else if (formattedSelectableLayerNames.length > 2) {
    const lastLayer = formattedSelectableLayerNames.pop();
    formattedSelectableLayerNames = `${formattedSelectableLayerNames.join(
      ", "
    )}, and ${lastLayer}`;
  }

  const modeStatusBanner = document.getElementById("mode-status-banner");
  modeStatusBanner.hidden = false;
  modeStatusBanner.classList.remove("mode-status-banner-sketch");
  modeStatusBanner.classList.add("mode-status-banner-select");

 // Replace the icon in the mode status banner
  const modeStatusIconSpan = document.getElementById("mode-status-icon-span");
  if (modeStatusIconSpan) {
    // Remove any existing calcite-icon
    const existingIcon = modeStatusIconSpan.querySelector("calcite-icon");
    if (existingIcon) {
      modeStatusIconSpan.removeChild(existingIcon);
    }
    // Add the cursor icon
    const cursorIcon = document.createElement("calcite-icon");
    cursorIcon.setAttribute("icon", "cursor");
    cursorIcon.setAttribute("scale", "s");
    modeStatusIconSpan.appendChild(cursorIcon);
  }

  const modeStatusTextSpan = document.getElementById("mode-status-text-span");
  modeStatusTextSpan.innerText = `Select Mode enabled for ${formattedSelectableLayerNames}.`;

  const enableSketchForLayerButtons = document.querySelectorAll(
    ".enable-sketch-button"
  );
  enableSketchForLayerButtons.forEach((button) => {
    button.style.visibility = "hidden";
    button.classList.remove("sketch-button-shadow", "pointer-events-none");
    button.disabled = false;
  });
  const enableSketchIcons = document.querySelectorAll(
    ".enable-sketch-icon"
  );
  enableSketchIcons.forEach((icon) => {
    icon.innerHTML = `<calcite-icon icon="pencil" scale="s"></calcite-icon>`;
  });
  const mapContainer = document.getElementById("viewDiv");
  mapContainer.classList.remove("sketch-shadow", "sketch-border");
  mapContainer.classList.add("select-shadow", "select-border");
  mapContainer.style.pointerEvents = "auto";

  const sketch = document.getElementById("asset-manager-sketch");
  sketch.setAttribute("hidden", "");

  const selectableAssetDisplayElements =
    document.querySelectorAll(".select-border");
  selectableAssetDisplayElements.forEach((element) => {
    element.classList.add("select-shadow");
  });

  const sketchableAssetDisplayElements =
    document.querySelectorAll(".sketch-border");
  sketchableAssetDisplayElements.forEach((element) => {
    element.classList.remove("sketch-shadow");
  });

  const shadowButtons = [];
  const collectShadowButtons = (node) => {
    if (!node) return;
    if (node.querySelectorAll) {
      const btns = node.querySelectorAll("button");
      // console.log("Found buttons in shadow DOM:", btns);
      if (btns.length) {
        shadowButtons.push(...btns);
      }
    }
    if (node.shadowRoot) {
      collectShadowButtons(node.shadowRoot);
    }
    if (node.children) {
      Array.from(node.children).forEach((child) => collectShadowButtons(child));
    }
  };

  collectShadowButtons(sketch);
  // console.log("All shadow DOM buttons:", shadowButtons);
  const targetButton = shadowButtons.find(
    (b) =>
      b.getAttribute("aria-label") &&
      b.getAttribute("aria-label").toLowerCase().includes("select")
  );
  if (targetButton) {
    targetButton.click();
    // console.log(`Clicked select tool button`);
  } else {
    console.warn(`Could not find the select tool button`);
  }

  setTimeout(() => {
    // Call this after the map widget is rendered
    injectMapSurfaceFocusStyle();
  }, 0);
};

export const handleSketchEnabled = () => {
  const enableSketchModeButton = document.getElementById("sketch-mode-button");
  if (enableSketchModeButton) {
    enableSketchModeButton.setAttribute("disabled", "true");
    enableSketchModeButton.classList.add("disabled-button");
  }
  const selectModeButton = document.getElementById("select-mode-button");
  if (selectModeButton) {
    selectModeButton.removeAttribute("disabled");
    selectModeButton.classList.remove("disabled-button");
  }
  // Show the mode status banner and update its style
  const modeStatusBanner = document.getElementById("mode-status-banner");
  modeStatusBanner.hidden = false;
  modeStatusBanner.classList.remove("mode-status-banner-select");
  modeStatusBanner.classList.add("mode-status-banner-sketch");

  const modeStatusIconSpan = document.getElementById("mode-status-icon-span");
  if (modeStatusIconSpan) {
    // Remove any existing calcite-icon
    const existingIcon = modeStatusIconSpan.querySelector("calcite-icon");
    if (existingIcon) {
      modeStatusIconSpan.removeChild(existingIcon);
    }
    // Add the pencil icon
    const pencilIcon = document.createElement("calcite-icon");
    pencilIcon.setAttribute("icon", "pencil");
    pencilIcon.setAttribute("scale", "s");
    modeStatusIconSpan.appendChild(pencilIcon);
  }

  const modeStatusTextSpan = document.getElementById("mode-status-text-span");
  modeStatusTextSpan.innerText = "Sketch Mode enabled. Select layer below.";

  const mapContainer = document.getElementById("viewDiv");
  mapContainer.classList.remove("select-shadow", "select-border");
  mapContainer.classList.add("sketch-shadow", "sketch-border");
  mapContainer.style.pointerEvents = "none";

  // Helper to apply sketch mode UI
  function applySketchModeUI() {
    // Show all sketch buttons
    const enableSketchButtons = document.querySelectorAll(".enable-sketch-button");
    enableSketchButtons.forEach((button) => {
      button.style.visibility = "visible";
    });

    // Remove select-shadow from selectable asset displays
    const selectableAssetDisplayElements = document.querySelectorAll(".select-border");
    selectableAssetDisplayElements.forEach((element) => {
      element.classList.remove("select-shadow");
    });

    // Add sketch-shadow to sketchable asset displays
    const sketchableAssetDisplayElements = document.querySelectorAll(".sketch-border");
    sketchableAssetDisplayElements.forEach((element) => {
      element.classList.add("sketch-shadow");
    });
  }

  // Try to apply immediately
  applySketchModeUI();

  // Set up MutationObserver on the correct parent
  const layerDataContainer = document.getElementById("layer-data-container");
  if (layerDataContainer) {
    const observer = new MutationObserver(() => {
      applySketchModeUI();
    });
    observer.observe(layerDataContainer, { childList: true, subtree: true });

    // Optionally disconnect after a short delay if you only need a one-time update
    setTimeout(() => observer.disconnect(), 1000);
  }
};


export const mapActionsDisabled = () => {
  const mapContainer = document.getElementById("viewDiv");
  mapContainer.style.pointerEvents = "none";
  const sketch = document.getElementById("asset-manager-sketch");
  sketch.setAttribute("hidden", "true");
};
